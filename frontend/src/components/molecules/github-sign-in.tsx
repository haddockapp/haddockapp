import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface GithubSignInButtonProps {
  redirectUrl: string;
  isSignedIn?: boolean;
  isDisabled?: boolean;
}
const GithubSignInButton: FC<GithubSignInButtonProps> = ({
  redirectUrl,
  isSignedIn,
  isDisabled,
}) => (
  <Button
    variant="dark"
    onClick={
      isSignedIn ? undefined : () => (window.location.href = redirectUrl)
    }
    disabled={isSignedIn || isDisabled}
    className="p-4 gap-2"
  >
    {isSignedIn ? (
      <>
        <Check />
        <span>Signed in</span>
      </>
    ) : (
      <>
        <img
          className="w-5 bg-white invert rounded-full"
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
        />
        <span className="font-semibold">Login with GitHub</span>
      </>
    )}
  </Button>
);

export default GithubSignInButton;
