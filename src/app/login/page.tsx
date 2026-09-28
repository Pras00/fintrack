import { ProductShowcase } from "@/components/auth/product-showcase";
import { AuthCard } from "@/components/auth/auth-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Sisi Kiri: Product Showcase (Desktop Only) */}
      <section className="hidden lg:block lg:w-[54%] xl:w-[56%] shrink-0">
        <ProductShowcase />
      </section>

      {/* Sisi Kanan: Auth Card Section */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative min-h-screen bg-background">
        {/* Top Right Floating Controls */}
        <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
          <ThemeToggle />
        </div>

        {/* Central Auth Card */}
        <div className="w-full flex justify-center">
          <AuthCard initialTab="login" />
        </div>
      </section>
    </main>
  );
}
