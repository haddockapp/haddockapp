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
import { twMerge } from "tailwind-merge";

interface SimpleDialogProps {
  Trigger?: FC<{ onOpen: () => void }>;
  Content: FC<{ onClose?: () => void; isAppSetup?: boolean }>;
  title: string;
  description?: JSX.Element | string;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}
const SimpleDialog: FC<SimpleDialogProps> = ({
  Trigger,
  Content,
  title,
  description,
  isOpen,
  onOpen,
  onClose,
  size = "md",
}) => (
  <Dialog
    onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}
    open={isOpen}
  >
    {Trigger && onOpen && (
      <DialogTrigger asChild>
        <Trigger onOpen={onOpen} />
      </DialogTrigger>
    )}
    <DialogContent
      className={twMerge(
        "flex flex-col w-full",
        size === "sm" && "md:w-[400px]",
        size === "md" && "md:w-[500px]",
        size === "lg" && "md:min-w-[600px]",
        size === "xl" && "md:min-w-[800px]",
        size === "2xl" && "md:min-w-[1000px]",
        size === "3xl" && "md:min-w-[1400px]",
        size === "full" && "md:min-w-full h-full",
        !onClose && "[&>button]:hidden"
      )}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <Divider />
      <Content onClose={onClose} />
    </DialogContent>
  </Dialog>
);

export default SimpleDialog;
