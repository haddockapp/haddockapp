import { FC, useEffect, useMemo, useState } from "react";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import ProjectsList from "@/components/organisms/ProjectsList";
import CreateProjectForm from "@/components/organisms/CreateProjectForm";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useDisclosure from "@/hooks/use-disclosure";
import { SearchBar } from "@/components/atoms/search";
import Kbd from "@/components/atoms/kbd";

const CreateProjectTrigger = ({ onOpen }: { onOpen: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "p"
      ) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);

  return (
    <div className="flex flex-row gap-2">
      <Kbd>⌘ + Shift + P</Kbd>
      <Button variant="shine" onClick={onOpen} className="gap-2 h-full">
        <PackagePlus className="text-primary-foreground/50" />
        <span>Deploy a project</span>
      </Button>
    </div>
  );
};

const Projects: FC = () => {
  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const disclosureMethods = useDisclosure();

  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name.includes(query)),
    [projects, query],
  );

  return (
    <div className="flex flex-col px-8 gap-4">
      <div className="flex flex-column justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <h1 className="text-typography/90 text-3xl font-bold">Projects</h1>
          <div className="hidden md:flex  flex-row gap-2">
            <div className="w-full max-w-[400px]">
              <SearchBar searchValue={query} onChangeSearchValue={setQuery} />
            </div>
            <Kbd>⌘ + Shift + S</Kbd>
          </div>
        </div>
        <SimpleDialog
          {...disclosureMethods}
          size="3xl"
          title="Create a project"
          Content={CreateProjectForm}
          Trigger={CreateProjectTrigger}
        />
      </div>
      <ProjectsList projects={filteredProjects} isLoading={isLoading} />
    </div>
  );
};

export default Projects;
