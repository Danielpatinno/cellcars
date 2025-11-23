"use client";

import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { SidebarProvider } from "../app/contexts/SidebarContext";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

