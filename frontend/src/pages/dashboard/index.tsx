import { FC } from "react";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import CreateProjectModal from "@/components/organisms/CreateProjectForm/CreateProjectModal";
import ProjectsList from "@/components/organisms/ProjectsList";

const Projects: FC = () => {
  const { data: projects, isLoading } = useGetProjectsQuery();

  return (
    <>
      <div className="flex flex-column justify-between mx-8">
        <h1 className="text-3xl font-bold mt-8">Projects</h1>
        <CreateProjectModal />
      </div>
      <ProjectsList projects={projects ?? []} isLoading={isLoading} />
    </>
  );
};

export default Projects;
