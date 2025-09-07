import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useDisclosure from "@/hooks/use-disclosure";
import { FC, useEffect, useState } from "react";
import { Trash } from "lucide-react";

interface DeleteProjectDialogProps {
  onDelete: () => void;
  isDisabled?: boolean;
}

const DeleteProjectDialog: FC<DeleteProjectDialogProps> = ({
  onDelete,
  isDisabled,
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setIsCountingDown(true);

      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        setIsCountingDown(false);
        clearInterval(timer);
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger disabled={isDisabled} asChild>
        <Button variant="destructive">
          <Trash className="mr-2" size={15} />
          Delete Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="self-center mb-2 text-destructive">
            Are you sure you want to delete this project?
          </DialogTitle>
          <DialogDescription className="text-sm text-destructive/70">
            Once deleted, all data related to this project will be permanently
            erased. This action is irreversible, so please proceed with caution.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-between my-4">
          <Button
            type="button"
            variant="secondary"
            className="w-28"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={isCountingDown}
            onClick={handleDelete}
            className="w-28"
          >
            {isCountingDown ? `${countdown}` : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectDialog;
