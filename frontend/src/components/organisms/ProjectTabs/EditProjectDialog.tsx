import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useDisclosure from "@/hooks/use-disclosure";
import { ProjectDto } from "@/services/backendApi/projects";
import { FC, useState } from "react";
import { Pencil } from "lucide-react";

interface EditProjectDialogProps {
  project: ProjectDto | undefined;
}

const EditProjectDialog: FC<EditProjectDialogProps> = ({ project }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [name, setName] = useState<string>(project?.vm.name ?? "");
  const [description, setDescription] = useState<string>(
    project?.vm.provider ?? ""
  );
  const onSubmit = () => {
    console.log(name, description);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-40 font-bold mt-4">
          <Pencil className="mr-2" />
          Edit this project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="self-center mb-2">
            {`Edit ${project?.vm.name ?? "this project"}`}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-600 text-sm">
          <Label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Project name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter the project name"
          />
          <Label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mt-4"
          >
            Project description
          </Label>
          <Input
            id="description"
            name="description"
            type="text"
            className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter the project description"
          />
        </DialogDescription>
        <DialogFooter className="justify-between my-4">
          <Button
            type="button"
            variant="secondary"
            className="w-28"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" variant="default" onClick={onSubmit}>
            Edit this project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
