import type { Meta, StoryObj } from "@storybook/react";
import ServiceCard from "@/components/organisms/ServiceCard";

const meta = {
  title: "Organisms/ServiceCard",
  component: ServiceCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: {
      action: "clicked",
      description: "Callback function when card is clicked",
    },
    name: {
      control: "text",
      description: "Service name",
    },
    image: {
      control: "text",
      description: "Docker image name",
    },
    icon: {
      control: "text",
      description: "URL of the service icon",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseService = {
  name: "PostgreSQL",
  image: "postgres:latest",
  icon: "https://www.postgresql.org/media/img/about/press/elephant.png",
};

export const Default: Story = {
  args: {
    ...baseService,
  },
};

export const CustomIcon: Story = {
  args: {
    ...baseService,
    icon: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/97_Docker_logo_logos-512.png",
    name: "Docker Service",
    image: "docker:latest",
  },
};
