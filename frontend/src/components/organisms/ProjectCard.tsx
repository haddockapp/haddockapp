import { Card, CardContent } from "@/components/ui/card";
import { FC } from "react";
import { Package } from "lucide-react";
import { ProjectDto } from "@/services/backendApi/projects";
import ProjectStatusBadge from "./ProjectManagement/ProjectStatusBadge";

interface ProjectCardProps {
  onClick?: () => void;
  project: ProjectDto;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Card
      className="w-full cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-card/10"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row text-center sm:text-start items-center sm:justify-between h-24">
          <div className="flex flex-row items-center gap-4">
            <div className="hidden sm:flex items-center">
              <Package className="text-typography/80" size={32} />
            </div>
            <div className="flex flex-col justify-start">
              <p className="text-xl font-bold text-typography/90 line-clamp-1">
                {project.name}
              </p>
              <div className="flex-row gap-1">
                <p className="text-typography/60">Last deployment date:</p>
                <p className="text-typography/80 font-semibold">12/09/2024</p>
              </div>
              <p className="text-typography/70 line-clamp-2">
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
