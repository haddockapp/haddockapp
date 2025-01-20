import GithubSignInButton from "@/components/molecules/github-sign-in";
import Configuration from "@/components/organisms/Configuration/SetupGithubApp";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import { Button } from "@/components/ui/button";
import useConfiguration from "@/hooks/use-configuration";
import useDisclosure from "@/hooks/use-disclosure";
import { useAppSelector } from "@/hooks/useStore";
import { GithubAuthReason } from "@/services/backendApi/auth";
import { FC } from "react";

type GithubAuthenticationProps = {
  reason: GithubAuthReason;
  authorizationName?: string;
};

const GithubAuthentication: FC<GithubAuthenticationProps> = ({
  reason,
  authorizationName,
}) => {
  const { githubConfig } = useConfiguration();

  const disclosureMethods = useDisclosure();

  const { isAuth } = useAppSelector((state) => state.auth);

  return (
    <div>
      {githubConfig ? (
        <GithubSignInButton
          isSignedIn={
            reason === GithubAuthReason.CREATE_AUTHORIZATION ? false : isAuth
          }
          redirectUrl={`https://github.com/login/oauth/authorize?client_id=${
            githubConfig?.clientId
          }&redirect_uri=${window.location.protocol}//${
            window.location.host
          }/github&scope=user%20repo${
            reason === GithubAuthReason.CREATE_AUTHORIZATION
              ? "&prompt=select_account&"
              : "&"
          }state=${JSON.stringify({ reason, authorizationName })}`}
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
