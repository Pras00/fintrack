import { ProductShowcase } from "@/components/auth/product-showcase";
import { AuthCard } from "@/components/auth/auth-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 pt-16 sm:pt-6 relative overflow-hidden bg-background text-foreground">
      {/* Ambient background glows for depth */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[100px] lg:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[100px] lg:blur-[130px] pointer-events-none" />

      {/* Floating Theme Toggle (Top Right) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Centered Main 2-Section Wrapper */}
      <div className="w-full max-w-6xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
        {/* Left Section: Product & Feature Showcase (Bento Cards) */}
        <section className="lg:col-span-7 order-2 lg:order-1">
          <ProductShowcase />
        </section>

        {/* Right Section: Elevated Auth Card */}
        <section className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <AuthCard initialTab="register" />
        </section>
      </div>
    </main>
  );
}
