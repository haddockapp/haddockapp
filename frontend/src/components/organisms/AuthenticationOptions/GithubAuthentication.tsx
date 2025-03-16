import GithubSignInButton from "@/components/molecules/github-sign-in";
import useConfiguration from "@/hooks/use-configuration";
import { useAppSelector } from "@/hooks/useStore";
import { GithubAuthReason } from "@/services/backendApi/auth";
import { FC } from "react";
import GithubApplicationSetup from "./GithubApplicationSetup";

type GithubAuthenticationProps = {
  reason: GithubAuthReason;
  authorizationName?: string;
};

const GithubAuthentication: FC<GithubAuthenticationProps> = ({
  reason,
  authorizationName,
}) => {
  const { githubConfig } = useConfiguration();

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
        <GithubApplicationSetup />
      )}
    </div>
  );
};

export default GithubAuthentication;
