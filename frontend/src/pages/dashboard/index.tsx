import ProjectCard from "@/components/organisms/ProjectCard";
import CreateProjectForm from "@/components/organisms/CreateProjectForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useDisclosure from "@/hooks/use-disclosure";
import { Plus } from "lucide-react";
import { FC } from "react";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Projects: FC = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <>
      <div className="flex flex-column justify-between mx-8">
        <h1 className="text-3xl font-bold mt-8">Projects</h1>
        <Dialog open={isOpen} onOpenChange={onToggle}>
          <DialogTrigger asChild>
            <Button className="mt-8 px-4" size="lg">
              <Plus size={24} className="mr-2" />
              Deploy a project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a project</DialogTitle>
              <DialogDescription>
                Fill the form to create a new project.
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm onClose={onClose} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mx-8 mt-4">
        {projects?.length === 0 && (
          <div className="flex flex-column justify-center items-center">
            <p className="text-lg">No projects found</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 w-full">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onCLick={() => navigate(`/project/${project.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
