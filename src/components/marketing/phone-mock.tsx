import { ArrowUpRight } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiX } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";
import { getTheme } from "@/lib/themes";

const sampleLinks = [
  { title: "Latest video — Studio tour", emoji: "▶" },
  { title: "Shop the presets", emoji: "✦" },
  { title: "Book a 1:1 session", emoji: "◷" },
];

/**
 * Decorative, static phone preview used on the marketing page to prove the
 * Noir Luminous public-page direction. The real live preview ships in Phase 2.
 */
export function PhoneMock({ className }: { className?: string }) {
  const { styles } = getTheme("noir");
  const background =
    styles.background.type === "gradient"
      ? `linear-gradient(${styles.background.angle}deg, ${styles.background.from}, ${styles.background.to})`
      : styles.background.type === "solid"
        ? styles.background.color
        : "#0a0a0b";

  return (
    <div
      className={cn(
        "relative w-[280px] shrink-0 rounded-[2.6rem] border border-white/10 bg-black/40 p-2.5 shadow-2xl shadow-black/60 backdrop-blur",
        className,
      )}
      aria-hidden
    >
      {/* Glow behind the device */}
      <div className="bg-brand/20 absolute -inset-6 -z-10 rounded-[3rem] blur-3xl" />

      <div
        className="relative overflow-hidden rounded-[2.1rem]"
        style={{ background, color: styles.textColor }}
      >
        {/* Notch */}
        <div className="absolute top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />

        <div className="flex flex-col items-center gap-4 px-5 pt-12 pb-7">
          <div className="from-brand to-brand-2 size-16 rounded-full bg-gradient-to-br p-[2px]">
            <div className="grid size-full place-items-center rounded-full bg-black/30 text-xl font-semibold">
              Y
            </div>
          </div>

          <div className="text-center">
            <p className="font-heading text-base font-semibold">Yanis</p>
            <p className="text-xs" style={{ color: styles.mutedTextColor }}>
              building things on the internet
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            {sampleLinks.map((link) => (
              <div
                key={link.title}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[13px] font-medium transition-transform"
                style={{ background: styles.buttonColor, color: styles.buttonTextColor }}
              >
                <span className="text-brand">{link.emoji}</span>
                <span className="flex-1 truncate">{link.title}</span>
                <ArrowUpRight className="size-3.5 opacity-50" />
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-center gap-4 opacity-80">
            <SiInstagram className="size-4" />
            <SiTiktok className="size-4" />
            <SiYoutube className="size-4" />
            <SiX className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
