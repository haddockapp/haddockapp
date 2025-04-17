import { FC, PropsWithChildren } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "@/services/backendApi/projects";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import Variables from "./Variables";

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
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </div>
  );
};

const SettingsTab: FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = useGetProjectsQuery().data?.find(
    (project) => project.id === projectId
  );
  const [deleteProject] = useDeleteProjectMutation();
  const handleDeleteProject = () => {
    deleteProject(projectId ?? "");
    navigate("/dashboard");
  };
  return (
    <div className="ml-8 mr-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Settings</h1>
      <SettingsTabAction
        title="Edit this project"
        description="Edit the name and description of this project."
      >
        <EditProjectDialog project={project} />
      </SettingsTabAction>

      <SettingsTabAction
        title="Delete this project"
        description="Deleting this project will permanently remove it from your Haddock instance, along with all its associated data. This action cannot be undone."
      >
        <DeleteProjectDialog onDelete={handleDeleteProject} />
      </SettingsTabAction>
      <Variables projectId={projectId ?? ""} />
    </div>
  );
};

export default SettingsTab;
