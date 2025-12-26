import { FC } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import LiquidEther from "@/components/atoms/liquid-ether";
import { useAppSelector } from "@/hooks/useStore";
import { Theme } from "@/services/settingsSlice";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "../ui/sidebar";
import { ArrowRight } from "lucide-react";
import Divider from "../atoms/divider";
import { Button } from "../ui/button";
import Settings from "../organisms/Settings";
import Kbd from "../atoms/kbd";

const Content: FC = () => {
  const selectedTheme = useAppSelector((state) => state.settings.theme);

  return (
    <div className="h-full w-full space-y-8 mb-2 px-2 py-2">
      <Header />
      <div
        className="-z-10"
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        {selectedTheme === Theme.DARK && (
          <LiquidEther
            colors={["#855CD6", "#B19EEF"]}
            mouseForce={12}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={9.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        )}
      </div>
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};

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
          <Kbd>⌘ + B</Kbd>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <Divider />
        <Settings onClose={toggleSidebar} />
      </SidebarContent>
    </Sidebar>
  );
};

const Layout: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);

  return (
    <SidebarProvider defaultOpen={isAuth}>
      <Content />
      <SettingsSidebar />
    </SidebarProvider>
  );
};

export default Layout;
