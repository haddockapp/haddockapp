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
}

const DeleteProjectDialog: FC<DeleteProjectDialogProps> = ({ onDelete }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [countdown, setCountdown] = useState(3);
  const [isDisabled, setIsDisabled] = useState(true);
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setIsDisabled(true);

      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        setIsDisabled(false);
        clearInterval(timer);
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-40 text-red-500 font-bold border-red-500 hover:bg-red-100 mt-4"
        >
          <Trash className="mr-2" />
          Delete Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="self-center mb-2 text-red-600">
            Are you sure you want to delete this project?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-700">
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
            disabled={isDisabled}
            onClick={handleDelete}
            className="w-28"
          >
            {isDisabled ? `${countdown}` : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectDialog;
