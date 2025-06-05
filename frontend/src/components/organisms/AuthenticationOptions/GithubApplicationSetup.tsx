import { Button } from "@/components/ui/button";
import { FC } from "react";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import useDisclosure from "@/hooks/use-disclosure";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const GithubApplicationSetup: FC = () => {
  const disclosureMethods = useDisclosure();

  const callbackUrl = `${window.location.origin}/github`;

  const handleCopyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    toast({
      title: "Copied to clipboard",
      duration: 1000,
    });
  };

  return (
    <SimpleDialog
      {...disclosureMethods}
      title="Add a new configuration"
      description={
        <>
          In order to use Haddock with a Github Application, you will need to
          setup your application in the Github Developer settings. This will
          allow Haddock to access your repositories and perform actions on your
          behalf.
          <br />
          In the Callback URL field, please choose{" "}
          <div className="inline-flex items-center space-x-1 pr-1">
            <b
              onClick={handleCopyCallbackUrl}
              className="cursor-pointer hover:underline"
            >
              {callbackUrl}
            </b>
            <Copy
              onClick={handleCopyCallbackUrl}
              size="16px"
              className="text-primary cursor-pointer"
            />
          </div>
          as your callback URL.
        </>
      }
      Content={Configuration}
      Trigger={({ onOpen }) => (
        <Button variant="outline" onClick={onOpen} className="space-x-2">
          <img
            className="w-5 rounded-full"
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
          />
          <span>App Configuration</span>
        </Button>
      )}
    />
  );
};

export default GithubApplicationSetup;
