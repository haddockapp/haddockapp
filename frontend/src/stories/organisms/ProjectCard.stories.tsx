import type { Meta, StoryObj } from "@storybook/react";
import ProjectCard from "@/components/organisms/ProjectCard";
import { baseProject } from "./data";
import { VmState } from "@/types/vm/vm";

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
