import type { Meta, StoryObj } from "@storybook/react";
import DeleteProjectDialog from "@/components/organisms/ProjectTabs/SettingsTab/DeleteProjectDialog";

const meta = {
  title: "Organisms/DeleteProjectDialog",
  component: DeleteProjectDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeleteProjectDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDelete: () => console.log("Project deleted"),
  },
};

export const WithCustomAction: Story = {
  args: {
    onDelete: () => alert("Project deleted successfully!"),
  },
};
