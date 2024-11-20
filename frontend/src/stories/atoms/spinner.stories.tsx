import HaddockSpinner from "@/components/atoms/spinner";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Atoms/HaddockSpinner",
  component: HaddockSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HaddockSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
