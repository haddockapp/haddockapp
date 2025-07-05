import { FC } from "react";
import OrDivider from "@/components/molecules/or-divider";
import GithubAuthentication from "./GithubAuthentication";
import EmailAuthentication from "./EmailAuthentication";
import { GithubAuthReason } from "@/services/backendApi/auth";

const AuthenticationOptions: FC = () => {
  return (
    <div className="space-y-4 max-w-[400px] w-full mx-auto text-center">
      <GithubAuthentication reason={GithubAuthReason.LOGIN} />
      <OrDivider />
      <EmailAuthentication />
    </div>
  );
};

export default AuthenticationOptions;
