import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand/15 absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-50" />
      </div>

      <div className="mb-8">
        <Logo />
      </div>

      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
