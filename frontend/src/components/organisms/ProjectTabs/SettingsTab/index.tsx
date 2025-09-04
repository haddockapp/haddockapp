import { FC, PropsWithChildren } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "@/services/backendApi/projects";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import Variables from "./Variables";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import HaddockSpinner from "@/components/atoms/spinner";

type SettingsTabActionProps = {
  title: string;
  description: string;
};

const SettingsTabAction: FC<PropsWithChildren<SettingsTabActionProps>> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex flex-row justify-between items-center border-b pb-4 mt-4 px-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-typography/80">{title}</h3>
        <p className="text-sm text-typography/60">{description}</p>
      </div>
      {children}
    </div>
  );
};

const SettingsTab: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projectId } = useParams();
  const project = useGetProjectsQuery().data?.find(
    (project) => project.id === projectId
  );
  const [deleteProject, { isLoading: isLoadingDelete }] =
    useDeleteProjectMutation();
  const handleDeleteProject = () => {
    deleteProject(projectId ?? "")
      .unwrap()
      .then(() => {
        toast({
          title: "Project deleted",
          description: "The project has been deleted successfully.",
          variant: "default",
        });
        navigate("/dashboard");
      })
      .catch(() => {
        toast({
          title: "Error deleting project",
          description: "An error occurred while deleting the project.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="px-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Settings</h1>
      <Dialog
        open={isLoadingDelete}
        onOpenChange={() => {
          navigate("/dashboard");
        }}
      >
        <DialogContent className="justify-center">
          <HaddockSpinner />
          <p>The project is being deleted...</p>
        </DialogContent>
      </Dialog>
      <SettingsTabAction
        title="Edit this project"
        description="Edit the name and description of this project."
      >
        <EditProjectDialog isDisabled={isLoadingDelete} project={project} />
      </SettingsTabAction>

      <SettingsTabAction
        title="Delete this project"
        description="Deleting this project will permanently remove it from your Haddock instance, along with all its associated data. This action cannot be undone."
      >
        <DeleteProjectDialog
          isDisabled={isLoadingDelete}
          onDelete={handleDeleteProject}
        />
      </SettingsTabAction>
      <Variables projectId={projectId ?? ""} />
    </div>
  );
};

export default SettingsTab;
