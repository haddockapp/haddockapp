import type { Meta, StoryObj } from "@storybook/react";
import GithubSignInButton from "@/components/molecules/github-sign-in";

const meta = {
  title: "Molecules/GithubSignInButton",
  component: GithubSignInButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isSignedIn: {
      control: {
        type: "boolean",
      },
      description: "Is user signed in",
    },
    redirectUrl: {
      control: {
        type: "text",
      },
      description:
        "Link to external identity provider page which handles authentication",
    },
  },
} satisfies Meta<typeof GithubSignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    redirectUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isSignedIn: false,
  },
};

export const SignedIn: Story = {
  args: {
    redirectUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isSignedIn: true,
  },
};
