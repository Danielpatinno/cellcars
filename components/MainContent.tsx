"use client";

import { useSidebar } from "../app/contexts/SidebarContext";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={`flex-1 transition-all duration-300 bg-white min-h-screen ${
        isCollapsed ? "ml-20" : "ml-64"
      }`}
    >
      {children}
    </main>
  );
}

