import { Button } from "@/components/ui/button";
import { ProjectDto } from "@/types/projects/projects.dto";
import { VmProvider, VmState } from "@/types/vm/vm";
import { Plus } from "lucide-react";
import { FC } from "react";

const Projects: FC = () => {
  const projects: ProjectDto[] = [
    {
      id: "1",
      sourceId: "1",
      vmId: "1",
      vm: {
        id: "1",
        name: "VM 1",
        status: VmState.Running,
        ip: "https://google.com",
        memory: 2048,
        disk: 20,
        cpus: 2,
        provider: VmProvider.Libvirt,
        createdAt: new Date(),
      },
      source: {
        id: "1",
        type: "github",
        authorizationId: "1",
        settings: {
          repository: "test",
          branch: "main",
          organization: "Epitech",
        },
      },
    },
  ];

  return (
    <div className="flex flex-column justify-between mx-8">
      <h1 className="text-3xl font-bold mt-8">Projects</h1>
      <Button className="mt-8 px-4" size="lg">
        <Plus size={24} className="mr-2" />
        Deploy a project
      </Button>
    </div>
  );
};

export default Projects;
