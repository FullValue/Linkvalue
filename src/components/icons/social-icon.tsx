import {
  SiInstagram,
  SiTiktok,
  SiX,
  SiYoutube,
  SiFacebook,
  SiGithub,
  SiSpotify,
  SiTwitch,
  SiThreads,
  SiPinterest,
  SiDiscord,
  SiTelegram,
  SiWhatsapp,
  SiSnapchat,
  SiReddit,
} from "@icons-pack/react-simple-icons";
import { Globe, Mail } from "lucide-react";
import type { SocialPlatform } from "@/lib/socials";

type IconProps = { className?: string };

// LinkedIn was removed from the simple-icons package, so we inline its mark.
function SiLinkedin({ className }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const ICONS: Record<SocialPlatform, React.ComponentType<IconProps>> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  x: SiX,
  youtube: SiYoutube,
  facebook: SiFacebook,
  linkedin: SiLinkedin,
  github: SiGithub,
  spotify: SiSpotify,
  twitch: SiTwitch,
  threads: SiThreads,
  pinterest: SiPinterest,
  discord: SiDiscord,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  snapchat: SiSnapchat,
  reddit: SiReddit,
  email: Mail,
  website: Globe,
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const Icon = ICONS[platform] ?? Globe;
  return <Icon className={className} />;
}
