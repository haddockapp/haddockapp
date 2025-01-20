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
import {
  ProjectDto,
  useUpdateProjectMutation,
} from "@/services/backendApi/projects/projects.service";
import { FC } from "react";
import { Pencil } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { EditProjectForm } from "./type";
import { useToast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  project: ProjectDto | undefined;
}

const EditProjectDialog: FC<EditProjectDialogProps> = ({ project }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [editProject] = useUpdateProjectMutation();
  const { toast } = useToast();

  const methods = useForm<EditProjectForm>({
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });
  const { handleSubmit, register } = methods;

  const onSubmit: SubmitHandler<EditProjectForm> = (data) => {
    editProject({ projectId: project?.id ?? "", body: data })
      .unwrap()
      .then(() => {
        toast({ title: "Project updated successfully", duration: 1000 });
        onClose();
      })
      .catch(() => {
        toast({
          title: "An error occurred",
          description: "Unable to update the project",
          duration: 1500,
          variant: "destructive",
        });
      });
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
            {`Edit ${project?.name ?? "this project"}`}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-600 text-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Project name
            </Label>
            <Input
              {...register("name", { required: true })}
              className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Project description
            </Label>
            <Input
              {...register("description", { required: false })}
              className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <DialogFooter className="justify-between my-4">
              <Button
                type="button"
                variant="secondary"
                className="w-28"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Edit this project
              </Button>
            </DialogFooter>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
