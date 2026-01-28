import { FC } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { ArrowRight } from "lucide-react";
import Divider from "@/components/atoms/divider";
import { Button } from "@/components/ui/button";
import Settings from "@/components/organisms/Settings";
import Kbd from "@/components/atoms/kbd";
import { formatShortcut } from "@/lib/utils";

const Content: FC = () => (
  <div className="h-full w-full">
    <header className="sticky top-0 bg-gradient-to-b from-card to-card/80 z-10 shadow-sm border-b">
      <Header />
    </header>
    <div className="px-2 py-6 relative">
      <div className="h-4 w-full absolute top-0 left-0 bg-gradient-to-b from-card/80 to-transparent pointer-events-none z-10" />
      <Outlet />
    </div>
  </div>
);

const SettingsSidebar: FC = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar className="z-[11]" side="right">
      <SidebarHeader>
        <div className="flex flex-row items-center gap-4">
          <Button onClick={toggleSidebar} variant="ghost" className="group p-2">
            <ArrowRight className="text-primary/70 group-hover:text-primary duration-500" />
          </Button>
          <span>Settings</span>
          <Kbd>{formatShortcut("⌘ + B")}</Kbd>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <Divider />
        <Settings onClose={toggleSidebar} />
      </SidebarContent>
    </Sidebar>
  );
};

const Layout: FC = () => (
  <SidebarProvider defaultOpen={false}>
    <Content />
    <SettingsSidebar />
  </SidebarProvider>
);

export default Layout;
