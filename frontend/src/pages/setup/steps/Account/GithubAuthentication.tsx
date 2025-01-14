import GithubSignInButton from "@/components/molecules/github-sign-in";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import { Button } from "@/components/ui/button";
import useConfiguration from "@/hooks/use-configuration";
import useDisclosure from "@/hooks/use-disclosure";
import { GithubAuthReason } from "@/services/backendApi/auth";
import { FC } from "react";

type GithubAuthenticationProps = {
  reason: GithubAuthReason;
};

const GithubAuthentication: FC<GithubAuthenticationProps> = ({ reason }) => {
  const { githubConfig } = useConfiguration();

  const disclosureMethods = useDisclosure();

  return (
    <div>
      {githubConfig ? (
        <GithubSignInButton
          redirectUrl={`https://github.com/login/oauth/authorize?client_id=${githubConfig?.clientId}&scope=user%20repo&prompt=select_account&state=${reason}`}
        />
      ) : (
        <SimpleDialog
          {...disclosureMethods}
          title="Add a new configuration"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Suspendisse mollis placerat leo in pellentesque. Vivamus tellus
dolor, euismod eget luctus vel, placerat nec metus. Proin nibh
ligula, porta eu libero ultricies, vulputate sodales augue."
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
      )}
    </div>
  );
};

export default GithubAuthentication;
