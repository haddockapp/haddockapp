import type { Meta, StoryObj } from "@storybook/react";
import ProjectCard from "@/components/organisms/ProjectCard";
import {
  ProjectDto,
  VmProvider,
  VmState,
} from "@/services/backendApi/projects";

const meta: Meta<typeof ProjectCard> = {
  title: "Organisms/ProjectCard",
  component: ProjectCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      action: "clicked",
      description: "Callback function when card is clicked",
    },
    project: {
      description: "Project data object",
      control: "object",
    },
  },
  decorators: [
    (Story) => (
      <div className="flex grid grid-cols-1 gap-4 w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseProject: ProjectDto = {
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

export const Default: Story = {
  args: {
    project: baseProject,
  },
};

export const Running: Story = {
  args: {
    project: baseProject,
  },
};

export const Starting: Story = {
  args: {
    project: {
      ...baseProject,
      vm: {
        ...baseProject.vm,
        status: VmState.Starting,
      },
    },
  },
};

export const Stopped: Story = {
  args: {
    project: {
      ...baseProject,
      vm: {
        ...baseProject.vm,
        status: VmState.Stopped,
      },
    },
  },
};

export const LongProjectName: Story = {
  args: {
    project: {
      ...baseProject,
      name: "This is a very long project name that should be truncated in the UI display",
    },
  },
};

export const LongDescription: Story = {
  args: {
    project: {
      ...baseProject,
      description:
        "This is a very long description that should be truncated after two lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  },
};
