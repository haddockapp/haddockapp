import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Divider from "../atoms/divider";

interface SimpleDialogProps {
  Trigger: FC<{ onOpen: () => void }>;
  Content: FC<{ onClose?: () => void; isAppSetup?: boolean }>;
  title: string;
  description: JSX.Element | string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isOpenDefault?: boolean;
}
const SimpleDialog: FC<SimpleDialogProps> = ({
  Trigger,
  Content,
  title,
  description,
  isOpen,
  isOpenDefault = false,
  onOpen,
  onClose,
}) => (
  <Dialog
    defaultOpen={isOpenDefault}
    onOpenChange={(open) => (open ? onOpen() : onClose())}
    open={isOpen}
  >
    <DialogTrigger asChild>
      <Trigger onOpen={onOpen} />
    </DialogTrigger>
    <DialogContent className="flex flex-col">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Divider />
      <Content onClose={onClose} />
    </DialogContent>
  </Dialog>
);

export default SimpleDialog;
