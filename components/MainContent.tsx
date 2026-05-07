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
      className={`flex-1 min-h-screen transition-all duration-300 bg-white text-zinc-900 overflow-x-hidden ${
        isCollapsed ? "ml-20" : "ml-64"
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}

