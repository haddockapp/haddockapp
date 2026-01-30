import { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import ProjectCard from "./ProjectCard";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "@/services/backendApi/projects";
import { AnimatePresence, motion } from "framer-motion";

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
    <div>
      <div className="grid grid-cols-1 gap-4 w-full">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : projects.length === 0 ? (
          <ProjectsListEmptyState />
        ) : (
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
