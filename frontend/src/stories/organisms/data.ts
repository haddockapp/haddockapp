import { ProjectDto } from "@/services/backendApi/projects";
import { VmState, VmProvider } from "@/types/vm/vm";

export const baseProject: ProjectDto = {
  id: "1",
  name: "Sample Project",
  description:
    "This is a sample project with a GitHub repository. It contains multiple services and is configured for development.",
  sourceId: "source-1",
  vmId: "vm-1",
  source: {
    id: "source-1",
    type: "github",
    authorizationId: "auth-1",
    settings: {
      branch: "main",
      repository: "my-project",
      organization: "my-org",
    },
  },
  vm: {
    id: "vm-1",
    status: VmState.Running,
    ip: "192.168.1.100",
    memory: 4096,
    disk: 50,
    cpus: 2,
    provider: VmProvider.Libvirt,
    createdAt: new Date("2024-03-20"),
  },
};
