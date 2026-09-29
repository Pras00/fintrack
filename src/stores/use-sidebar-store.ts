import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;        // Desktop open/closed state (defaults to true)
  isMobileOpen: boolean;  // Mobile/tablet drawer open/closed state
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: true,
  isMobileOpen: false,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  openMobile: () => set({ isMobileOpen: true }),
  closeMobile: () => set({ isMobileOpen: false }),
  toggle: () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      get().toggleMobile();
    } else {
      get().toggleSidebar();
    }
  },
}));
