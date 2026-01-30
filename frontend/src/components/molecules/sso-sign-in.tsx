import { FC } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

interface SSOSignInButtonProps {
  redirectUrl: string;
  isDisabled?: boolean;
}

const SSOSignInButton: FC<SSOSignInButtonProps> = ({
  redirectUrl,
  isDisabled,
}) => (
  <Button
    variant="outline"
    onClick={() => (window.location.href = redirectUrl)}
    disabled={isDisabled}
    className="p-4 gap-2 w-full"
  >
    <KeyRound className="w-5 h-5" />
    <span className="font-semibold">Login with SSO</span>
  </Button>
);

export default SSOSignInButton;

