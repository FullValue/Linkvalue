"use client";

import { createContext, useContext, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Block, BlockType } from "@/lib/supabase/types";
import { resolveStyles, type CustomStyles, type ResolvedStyles } from "@/lib/themes";
import {
  createBlockAction,
  updateBlockAction,
  toggleBlockAction,
  deleteBlockAction,
  reorderBlocksAction,
  updateProfileAction,
  setAvatarAction,
  saveAppearanceAction,
  setHeaderLayoutAction,
  setBannerAction,
  type Result,
} from "@/app/(dashboard)/dashboard/actions";

export interface BuilderProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme_id: string;
  custom_styles: CustomStyles;
  header_layout: string;
  banner_url: string | null;
}

interface BuilderApi {
  userId: string;
  profile: BuilderProfile;
  blocks: Block[];
  styles: ResolvedStyles;
  createBlock: (type: BlockType, values: unknown) => Promise<Result<Block>>;
  updateBlock: (id: string, type: BlockType, values: unknown) => Promise<Result<Block>>;
  toggleBlock: (id: string, isActive: boolean) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  saveProfile: (values: { display_name: string; bio: string }) => Promise<Result>;
  setProfileLocal: (patch: Partial<BuilderProfile>) => void;
  setAvatar: (url: string | null) => Promise<void>;
  setTheme: (themeId: string) => void;
  updateStyles: (patch: Partial<CustomStyles>) => void;
  setHeaderLayout: (layout: string) => void;
  setBanner: (url: string | null) => Promise<void>;
}

const Ctx = createContext<BuilderApi | null>(null);

export function useBuilder(): BuilderApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
}

export function BuilderProvider({
  userId,
  initialProfile,
  initialBlocks,
  children,
}: {
  userId: string;
  initialProfile: BuilderProfile;
  initialBlocks: Block[];
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const styles = useMemo(
    () => resolveStyles(profile.theme_id, profile.custom_styles),
    [profile.theme_id, profile.custom_styles],
  );

  const createBlock = useCallback(async (type: BlockType, values: unknown) => {
    const res = await createBlockAction(type, values);
    if (res.error) toast.error(res.error);
    if (res.data) setBlocks((prev) => [...prev, res.data!]);
    return res;
  }, []);

  const updateBlock = useCallback(
    async (id: string, type: BlockType, values: unknown) => {
      const res = await updateBlockAction(id, type, values);
      if (res.error) toast.error(res.error);
      if (res.data) {
        setBlocks((prev) => prev.map((b) => (b.id === id ? res.data! : b)));
      }
      return res;
    },
    [],
  );

  // Capture the snapshot inside the updater (not from the render closure) so a
  // failed mutation reverts the *latest* state even under rapid edits.
  const toggleBlock = useCallback(async (id: string, isActive: boolean) => {
    let prev: Block[] = [];
    setBlocks((bs) => {
      prev = bs;
      return bs.map((b) => (b.id === id ? { ...b, is_active: isActive } : b));
    });
    const res = await toggleBlockAction(id, isActive);
    if (res.error) {
      toast.error(res.error);
      setBlocks(prev);
    }
  }, []);

  const removeBlock = useCallback(async (id: string) => {
    let prev: Block[] = [];
    setBlocks((bs) => {
      prev = bs;
      return bs.filter((b) => b.id !== id);
    });
    const res = await deleteBlockAction(id);
    if (res.error) {
      toast.error(res.error);
      setBlocks(prev);
    } else {
      toast.success("Block deleted");
    }
  }, []);

  const reorder = useCallback(async (orderedIds: string[]) => {
    let prev: Block[] = [];
    setBlocks((bs) => {
      prev = bs;
      const map = new Map(bs.map((b) => [b.id, b]));
      let i = 0;
      const reordered = orderedIds
        .map((id) => map.get(id))
        .filter((b): b is Block => Boolean(b))
        .map((b) => ({ ...b, position: i++ }));
      const untouched = bs.filter((b) => !orderedIds.includes(b.id));
      return [...reordered, ...untouched];
    });
    const res = await reorderBlocksAction(orderedIds);
    if (res.error) {
      toast.error(res.error);
      setBlocks(prev);
    }
  }, []);

  const saveProfile = useCallback(
    async (values: { display_name: string; bio: string }) => {
      const res = await updateProfileAction(values);
      if (res.error) toast.error(res.error);
      else
        setProfile((p) => ({
          ...p,
          display_name: values.display_name.trim() || null,
          bio: values.bio.trim() || null,
        }));
      return res;
    },
    [],
  );

  const setProfileLocal = useCallback((patch: Partial<BuilderProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const setAvatar = useCallback(async (url: string | null) => {
    let prev: string | null = null;
    setProfile((p) => {
      prev = p.avatar_url;
      return { ...p, avatar_url: url };
    });
    const res = await setAvatarAction(url);
    if (res.error) {
      toast.error(res.error);
      setProfile((p) => ({ ...p, avatar_url: prev }));
    }
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistAppearance = useCallback((themeId: string, customStyles: CustomStyles) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await saveAppearanceAction(themeId, customStyles);
      if (res.error) toast.error(res.error);
    }, 500);
  }, []);

  const setTheme = useCallback(
    (themeId: string) => {
      setProfile((p) => ({ ...p, theme_id: themeId, custom_styles: {} }));
      persistAppearance(themeId, {});
    },
    [persistAppearance],
  );

  const updateStyles = useCallback(
    (patch: Partial<CustomStyles>) => {
      setProfile((p) => {
        const custom_styles = { ...p.custom_styles, ...patch };
        persistAppearance(p.theme_id, custom_styles);
        return { ...p, custom_styles };
      });
    },
    [persistAppearance],
  );

  const setHeaderLayout = useCallback((layout: string) => {
    let prev = "classic";
    setProfile((p) => {
      prev = p.header_layout;
      return { ...p, header_layout: layout };
    });
    setHeaderLayoutAction(layout).then((res) => {
      if (res.error) {
        toast.error(res.error);
        setProfile((p) => ({ ...p, header_layout: prev }));
      }
    });
  }, []);

  const setBanner = useCallback(async (url: string | null) => {
    let prev: string | null = null;
    setProfile((p) => {
      prev = p.banner_url;
      return { ...p, banner_url: url };
    });
    const res = await setBannerAction(url);
    if (res.error) {
      toast.error(res.error);
      setProfile((p) => ({ ...p, banner_url: prev }));
    }
  }, []);

  const api = useMemo<BuilderApi>(
    () => ({
      userId,
      profile,
      blocks,
      styles,
      createBlock,
      updateBlock,
      toggleBlock,
      removeBlock,
      reorder,
      saveProfile,
      setProfileLocal,
      setAvatar,
      setTheme,
      updateStyles,
      setHeaderLayout,
      setBanner,
    }),
    [
      userId,
      profile,
      blocks,
      styles,
      createBlock,
      updateBlock,
      toggleBlock,
      removeBlock,
      reorder,
      saveProfile,
      setProfileLocal,
      setAvatar,
      setTheme,
      updateStyles,
      setHeaderLayout,
      setBanner,
    ],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
