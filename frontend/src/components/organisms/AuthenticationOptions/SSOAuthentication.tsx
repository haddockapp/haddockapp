import SSOSignInButton from "@/components/molecules/sso-sign-in";
import { useAppSelector } from "@/hooks/useStore";
import useConfiguration from "@/hooks/use-configuration";
import { FC } from "react";

const SSOAuthentication: FC = () => {
  const { ssoConfig } = useConfiguration();
  const backendUrl = useAppSelector((state) => state.config.backendUrl);

  // Only show SSO button if SSO is configured (all required fields present)
  if (!ssoConfig || !backendUrl) {
    return null;
  }

  const ssoUrl = `${backendUrl}/auth/saml`;

  return <SSOSignInButton redirectUrl={ssoUrl} />;
};

export default SSOAuthentication;

