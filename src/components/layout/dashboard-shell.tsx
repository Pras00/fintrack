import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Sidebar Nav - Fixed */}
      <Sidebar />

      {/* Main Body - Scrollable */}
      <div id="main-content-scroll" className="flex flex-1 flex-col h-screen overflow-y-auto min-w-0">
        <Header />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
