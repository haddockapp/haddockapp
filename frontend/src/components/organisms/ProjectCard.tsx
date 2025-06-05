import { Card, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { FolderGit2 } from "lucide-react";
import { ProjectDto } from "@/services/backendApi/projects";
import ProjectStatusBadge from "./ProjectManagement/ProjectStatusBadge";

interface ProjectCardProps {
  onClick?: () => void;
  project: ProjectDto;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onClick }) => {
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
                {project.description ?? ""}
              </p>
            </div>
          </div>
          <div className="self-center">
            <ProjectStatusBadge status={project.vm.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
