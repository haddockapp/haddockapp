import { Card, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { FolderGit2 } from "lucide-react";
import { ProjectDto, VmState } from "@/services/backendApi/projects";

interface ProjectCardProps {
  onClick?: () => void;
  project: ProjectDto;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ProjectCard: FC<ProjectCardProps> = ({ project, onClick }) => {
  const getDotColor = () => {
    if (project.vm.status === VmState.Running) return "bg-green-500";
    if (project.vm.status === VmState.Starting) return "bg-yellow-500";
    return "bg-red-500";
  };
  return (
    <Card
      className="w-full cursor-pointer transition-colors duration-200 hover:bg-gray-100"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between h-24">
          <div className="flex flex-row items-center gap-4 w-2/3">
            <div className="flex items-center">
              <FolderGit2 size={64} />
            </div>
            <div className="flex flex-col justify-start">
              <p className="text-xl font-bold text-gray-900 line-clamp-1">
                {project.name}
              </p>
              <div className="flex flex-row gap-1">
                <p className="text-gray-600">Last deployment date:</p>
                <p className="text-gray-800 font-semibold">12/09/2024</p>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {project.description ?? "No description for this project ..."}
              </p>
            </div>
          </div>
          <div className="self-center flex flex-row items-center gap-2">
            <p className="text-gray-800 font-bold">
              {capitalizeFirstLetter(project.vm.status)}
            </p>
            <div className={`w-4 h-4 rounded-full ${getDotColor()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
