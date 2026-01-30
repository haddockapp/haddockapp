import { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "@/services/backendApi/projects";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import VariablesList from "./VariablesList";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import HaddockSpinner from "@/components/atoms/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, ShieldAlert, Variable } from "lucide-react";

const SettingsTab: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projectId } = useParams();
  const project = useGetProjectsQuery().data?.find(
    (project) => project.id === projectId,
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
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
      </div>

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

      {/* General Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your project's basic information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
            <div>
              <h3 className="font-semibold">Project Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your project name and description.
              </p>
            </div>
            <EditProjectDialog isDisabled={isLoadingDelete} project={project} />
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Variable className="w-5 h-5 text-primary" />
            <CardTitle>Environment Variables</CardTitle>
          </div>
          <CardDescription>
            Manage environment variables for your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariablesList projectId={projectId ?? ""} />
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50/10 overflow-hidden">
        <CardHeader className="border-b border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/10">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Irreversible actions for your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-card border border-red-200 dark:border-red-900/30 rounded-lg">
            <div className="space-y-1">
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                Delete Project
              </h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Permanently delete this project and all of its data.
              </p>
            </div>
            <DeleteProjectDialog
              isDisabled={isLoadingDelete}
              onDelete={handleDeleteProject}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
