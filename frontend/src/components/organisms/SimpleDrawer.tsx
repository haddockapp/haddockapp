import { ArrowRight } from "lucide-react";
import { FC } from "react";
import Divider from "@/components/atoms/divider";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";

interface SimpleDrawerProps {
  Trigger: FC<{ onOpen: () => void }>;
  Content: FC<{ onClose: () => void }>;
  title: string;
}
const SimpleDrawer: FC<SimpleDrawerProps> = ({ Content, title }) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center space-x-1">
          <Button onClick={() => {}} variant="ghost" className="group p-2">
            <ArrowRight className="text-primary/70 group-hover:text-primary duration-500" />
          </Button>
          <span>{title}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <Divider />
        <Content onClose={() => {}} />
      </SidebarContent>
    </Sidebar>
  );
};

export default SimpleDrawer;
