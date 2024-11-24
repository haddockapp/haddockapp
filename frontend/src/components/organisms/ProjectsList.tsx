import { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import ProjectCard from "./ProjectCard";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "@/services/backendApi/projects";

const ProjectsListEmptyState: FC = () => (
  <div className="flex flex-column justify-center items-center">
    <p className="text-lg">No projects found</p>
  </div>
);

interface ProjectsListProps {
  projects: ProjectDto[];
  isLoading: boolean;
}
const ProjectsList: FC<ProjectsListProps> = ({ isLoading, projects }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-8 mt-4">
      <div className="grid grid-cols-1 gap-4 w-full">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : projects.length === 0 ? (
          <ProjectsListEmptyState />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
