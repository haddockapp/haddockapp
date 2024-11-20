import StepTitle from "@/components/atoms/step-title";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Atoms/StepTitle",
  component: StepTitle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    step: {
      control: {
        type: "number",
      },
      description: "Step number",
    },
    total: {
      control: {
        type: "number",
      },
      description: "Total steps",
    },
    title: {
      control: {
        type: "text",
      },
      description: "Step title",
    },
  },
} satisfies Meta<typeof StepTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    step: 1,
    total: 3,
    title: "Administrator account",
  },
};

export const Total: Story = {
  args: {
    step: 2,
    total: 2,
    title: "Lorem Ipsum",
  },
};
