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
  Content: FC<{ onClose: () => void }>;
  title: string;
  description: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const SimpleDialog: FC<SimpleDialogProps> = ({
  Trigger,
  Content,
  title,
  description,
  isOpen,
  onOpen,
  onClose,
}) => (
  <Dialog onOpenChange={(open) => (open ? onOpen() : onClose())} open={isOpen}>
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
