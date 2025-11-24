import { FC } from "react";
import OrDivider from "@/components/molecules/or-divider";
import GithubAuthentication from "./GithubAuthentication";
import EmailAuthentication from "./EmailAuthentication";
import SSOAuthentication from "./SSOAuthentication";
import { GithubAuthReason } from "@/services/backendApi/auth";
import useConfiguration from "@/hooks/use-configuration";

const AuthenticationOptions: FC = () => {
  const { ssoConfig } = useConfiguration();

  return (
    <div className="space-y-4 max-w-[400px] w-full mx-auto text-center">
      {ssoConfig && (
        <>
          <SSOAuthentication />
          <OrDivider />
        </>
      )}
      <GithubAuthentication reason={GithubAuthReason.LOGIN} />
      <OrDivider />
      <EmailAuthentication />
    </div>
  );
};

export default AuthenticationOptions;
