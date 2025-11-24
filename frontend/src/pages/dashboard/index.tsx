import { FC } from "react";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import ProjectsList from "@/components/organisms/ProjectsList";
import CreateProjectForm from "@/components/organisms/CreateProjectForm";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useDisclosure from "@/hooks/use-disclosure";

const Projects: FC = () => {
  const { data: projects, isLoading } = useGetProjectsQuery();
  const disclosureMethods = useDisclosure();
  return (
    <>
      <div className="flex flex-column justify-between mx-8">
        <h1 className="text-typography/90 text-3xl font-bold mt-8">Projects</h1>
        <SimpleDialog
          {...disclosureMethods}
          title="Create a project"
          description={
            <p>
              <span>To get started, deploy your project using either : </span>
              <ul className="list-disc list-inside">
                <li>a zip file from your computer;</li>
                <li>a GitHub repository you have access to;</li>
                <li>one of Haddock's preconfigured templates.</li>
              </ul>
            </p>
          }
          Content={CreateProjectForm}
          Trigger={({ onOpen }) => (
            <Button onClick={onOpen} className="gap-2">
              <PackagePlus className="text-primary-foreground/50" />
              <span>Deploy a project</span>
            </Button>
          )}
        />
      </div>
      <ProjectsList projects={projects ?? []} isLoading={isLoading} />
    </>
  );
};

export default Projects;
