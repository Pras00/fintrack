import { ProductShowcase } from "@/components/auth/product-showcase";
import { AuthCard } from "@/components/auth/auth-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  return (
    <main className="h-screen w-screen overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 relative bg-background text-foreground select-none">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 lg:w-[480px] lg:h-[480px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 lg:w-[480px] lg:h-[480px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Centered Main 2-Section Content */}
      <div className="w-full max-w-5xl lg:max-w-[1080px] xl:max-w-6xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
        {/* Left Section: Creative Financial Overview (Desktop) */}
        <section className="hidden lg:block lg:col-span-7">
          <ProductShowcase />
        </section>

        {/* Right Section: Elevated Auth Card */}
        <section className="w-full lg:col-span-5 flex justify-center">
          <AuthCard initialTab="register" />
        </section>
      </div>
    </main>
  );
}
