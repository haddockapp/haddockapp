import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FC } from "react";
import CreateProjectForm from ".";
import useDisclosure from "@/hooks/use-disclosure";

const CreateProjectModal: FC = () => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button className="mt-8 px-4" size="lg">
          <Plus size={24} className="mr-2" />
          Deploy a project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Fill the form to create a new project.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
