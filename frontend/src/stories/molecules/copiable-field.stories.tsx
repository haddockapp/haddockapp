import CopiableField from "@/components/molecules/copiable-field";
import { Toaster } from "@/components/ui/toaster";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Molecules/CopiableField",
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <div className="h-40">
          <Story />
        </div>
      </>
    ),
  ],
  component: CopiableField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: {
        type: "text",
      },
      description: "Value to be copied",
    },
  },
} satisfies Meta<typeof CopiableField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

export const Empty: Story = {
  args: {
    value: "",
  },
};
