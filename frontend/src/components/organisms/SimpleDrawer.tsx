import useDisclosure from "@/hooks/use-disclosure";
import { ArrowRight } from "lucide-react";
import { FC } from "react";
import Divider from "@/components/atoms/divider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";

interface SimpleDrawerProps {
  Trigger: FC<{ onOpen: () => void }>;
  Content: FC<{ onClose: () => void }>;
  title: string;
}
const SimpleDrawer: FC<SimpleDrawerProps> = ({ Content, Trigger, title }) => {
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();

  return (
    <Drawer
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={isOpen}
      direction="right"
    >
      <DrawerTrigger asChild>
        <Trigger onOpen={onOpen} />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="flex flex-row items-center space-x-1">
            <Button onClick={onToggle} variant="ghost" className="group p-2">
              <ArrowRight className="text-primary/70 group-hover:text-primary duration-500" />
            </Button>
            <span>{title}</span>
          </DrawerTitle>
        </DrawerHeader>
        <Divider />
        <Content onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
};

export default SimpleDrawer;
