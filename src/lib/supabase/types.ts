/**
 * Database types.
 *
 * Hand-authored to match the SQL in supabase/migrations/ so the app is fully
 * typed before a Supabase project exists. Once linked, regenerate with:
 *
 *   pnpm db:types
 *   (= supabase gen types typescript --linked > src/lib/supabase/types.ts)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Block discriminator. Kept in sync with the `blocks.type` CHECK constraint. */
export type BlockType = "link" | "embed" | "social";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          theme_id: string;
          custom_styles: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme_id?: string;
          custom_styles?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme_id?: string;
          custom_styles?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          profile_id: string;
          type: BlockType;
          title: string | null;
          url: string | null;
          icon: string | null;
          position: number;
          is_active: boolean;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type: BlockType;
          title?: string | null;
          url?: string | null;
          icon?: string | null;
          position?: number;
          is_active?: boolean;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          type?: BlockType;
          title?: string | null;
          url?: string | null;
          icon?: string | null;
          position?: number;
          is_active?: boolean;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks: {
        Row: {
          id: string;
          block_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          block_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          block_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clicks_block_id_fkey";
            columns: ["block_id"];
            referencedRelation: "blocks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clicks_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      page_views: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_views_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      link_click_counts: {
        Args: Record<string, never>;
        Returns: {
          block_id: string;
          title: string | null;
          url: string | null;
          type: BlockType;
          clicks: number;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

/* Convenience row aliases. */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];
export type Click = Database["public"]["Tables"]["clicks"]["Row"];
export type PageView = Database["public"]["Tables"]["page_views"]["Row"];
