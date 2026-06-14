import Link from "next/link";
import {
  ArrowRight,
  GripVertical,
  Palette,
  BarChart3,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { PhoneMock } from "@/components/marketing/phone-mock";
import { siteConfig } from "@/lib/site";

const features = [
  {
    icon: GripVertical,
    title: "Drag-and-drop builder",
    body: "Reorder links, embeds and social rows with a flick. Changes land instantly in a live phone preview.",
  },
  {
    icon: Palette,
    title: "Premium themes",
    body: "Start from a hand-tuned theme, then fine-tune colours, fonts and button shapes until it's unmistakably you.",
  },
  {
    icon: BarChart3,
    title: "Privacy-first analytics",
    body: "See total views and which links earn the clicks — counted server-side, with no creepy tracking.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60" />
        <div className="bg-brand/20 absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-brand-2/10 absolute top-1/3 -right-40 size-[30rem] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-border/60 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
            <a
              href="#features"
              className="hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Features
            </a>
            <a
              href="#how"
              className="hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="flex flex-col items-start">
            <span className="border-border bg-card/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="text-brand size-3.5" />
              Your link in bio, finally premium
            </span>

            <h1 className="font-heading mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              One link for <span className="text-gradient">everything</span> you make.
            </h1>

            <p className="text-muted-foreground mt-5 max-w-md text-lg leading-relaxed text-pretty">
              {siteConfig.name} is the link-in-bio that actually looks like you. Build a
              stunning page in minutes, customise every pixel, and track what your
              audience clicks.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-1.5">
                <Link href="/register">
                  Claim your {siteConfig.name.toLowerCase()} page
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">See what&apos;s inside</Link>
              </Button>
            </div>

            <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {["Free to start", "No code", "Ready in 2 minutes"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="text-brand size-4" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMock />
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16"
        >
          <div className="max-w-xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need, nothing you don&apos;t.
            </h2>
            <p className="text-muted-foreground mt-3">
              A focused toolkit built around one job: turning a single link into the best
              first impression on the internet.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-luminous group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="bg-brand-muted text-brand grid size-11 place-items-center rounded-xl">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-heading mt-4 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 pb-24">
          <div className="border-luminous relative overflow-hidden rounded-3xl px-8 py-14 text-center">
            <div className="bg-brand/15 absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full blur-[100px]" />
            <h2 className="font-heading relative text-3xl font-semibold tracking-tight text-balance">
              Ready to make your link unforgettable?
            </h2>
            <p className="text-muted-foreground relative mx-auto mt-3 max-w-md">
              Join creators building a page they&apos;re proud to share.
            </p>
            <Button asChild size="lg" className="relative mt-7 gap-1.5">
              <Link href="/register">
                Get started — it&apos;s free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm sm:flex-row">
          <Logo />
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Crafted with care.
          </p>
        </div>
      </footer>
    </div>
  );
}
