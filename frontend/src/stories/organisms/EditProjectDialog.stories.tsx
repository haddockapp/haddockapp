import type { Meta, StoryObj } from "@storybook/react";
import EditProjectDialog from "@/components/organisms/ProjectTabs/EditProjectDialog";
import {
  ProjectDto,
  VmProvider,
  VmState,
} from "@/services/backendApi/projects";
import { http, HttpResponse } from "msw";
import { Provider } from "react-redux";
import { store } from "@/app/store";

const meta = {
  title: "Organisms/EditProjectDialog",
  component: EditProjectDialog,
  parameters: {
    layout: "centered",
    msw: {
      handlers: [
        http.patch("*/projects/:projectId", () => {
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div className="w-[600px]">
          <Story />
        </div>
      </Provider>
    ),
  ],
} satisfies Meta<typeof EditProjectDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseProject: ProjectDto = {
  id: "1",
  name: "Sample Project",
  description: "This is a sample project description",
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

export const NoDescription: Story = {
  args: {
    project: {
      ...baseProject,
      description: undefined,
    },
  },
};

export const LongProjectName: Story = {
  args: {
    project: {
      ...baseProject,
      name: "This is a very long project name that should still work in the dialog",
    },
  },
};

export const LongDescription: Story = {
  args: {
    project: {
      ...baseProject,
      description:
        "This is a very long project description that contains multiple sentences. It should demonstrate how the dialog handles longer text content. The description field should be able to accommodate this amount of text while maintaining proper layout and readability.",
    },
  },
};

export const UndefinedProject: Story = {
  args: {
    project: undefined,
  },
};
