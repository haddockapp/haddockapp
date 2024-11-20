import ProjectsList from "@/components/organisms/ProjectsList";
import { Meta, StoryObj } from "@storybook/react";
import { baseProject } from "./data";

const meta: Meta<typeof ProjectsList> = {
  title: "Organisms/ProjectsList",
  component: ProjectsList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    projects: {
      description: "List of projects",
      control: "object",
    },
    isLoading: {
      description: "Loading state",
      control: "boolean",
    },
  },
  decorators: [(Story) => <Story />],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    projects: [baseProject, baseProject, baseProject],
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    projects: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    isLoading: false,
  },
};
