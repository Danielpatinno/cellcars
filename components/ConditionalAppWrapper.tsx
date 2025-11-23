"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "../app/contexts/SidebarContext";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

export default function ConditionalAppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isUploadPage = pathname?.startsWith("/vehicles/upload");

  // Se for página de login ou upload, não renderizar sidebar
  if (isLoginPage || isUploadPage) {
    return <>{children}</>;
  }

  // Para outras páginas, renderizar com sidebar
  return (
    <SidebarProvider>
      <Sidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}


