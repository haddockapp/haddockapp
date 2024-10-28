import { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "@/services/backendApi/projects";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectDialog from "./EditProjectDialog";

const SettingsTab: FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = useGetProjectsQuery().data?.find(
    (project) => project.id === projectId
  );
  console.log(project);
  const [deleteProject] = useDeleteProjectMutation();
  const handleDeleteProject = () => {
    deleteProject(projectId ?? "");
    navigate("/dashboard");
  };
  return (
    <div className="mx-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Settings</h1>
      <div className="flex flex-row justify-between items-center border-b pb-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit this project
          </h3>
          <p className="text-sm text-gray-600">
            Edit the name and description of this project.
          </p>
        </div>
        <EditProjectDialog project={project} />
      </div>
      <div className="flex flex-row justify-between items-center border-b pb-4 mt-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Delete this project
          </h3>
          <p className="text-sm text-gray-600">
            Deleting this project will permanently remove it from your Haddock
            instance, along with all its associated data. This action cannot be
            undone.
          </p>
        </div>
        <DeleteProjectDialog onDelete={handleDeleteProject} />
      </div>
    </div>
  );
};

export default SettingsTab;
