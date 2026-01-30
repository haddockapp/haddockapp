import {
  useGetConfigurationQuery,
  ConfigurationType,
} from "@/services/backendApi/configuration";
import { useMemo } from "react";

const useConfiguration = () => {
  const { data: configuration } = useGetConfigurationQuery();
  const githubConfig = useMemo<{
    clientId: string;
  } | null>(() => {
    function getConfigurationValue(toFind: ConfigurationType) {
      const value = configuration?.find(({ key }) => key === toFind)?.value;
      if (!value) throw new Error(`Missing configuration value for ${toFind}`);

      return value;
    }

    try {
      return {
        clientId: getConfigurationValue(ConfigurationType.GITHUB_CLIENT_ID),
      };
    } catch {
      return null;
    }
  }, [configuration]);

  const ssoConfig = useMemo<{
    entryPoint: string;
    issuer: string;
    callbackUrl: string;
  } | null>(() => {
    function getConfigurationValue(toFind: ConfigurationType) {
      const value = configuration?.find(({ key }) => key === toFind)?.value;
      if (!value) throw new Error(`Missing configuration value for ${toFind}`);

      return value;
    }

    try {
      return {
        entryPoint: getConfigurationValue(ConfigurationType.SAML_ENTRY_POINT),
        issuer: getConfigurationValue(ConfigurationType.SAML_ISSUER),
        callbackUrl: getConfigurationValue(ConfigurationType.SAML_CALLBACK_URL),
      };
    } catch {
      return null;
    }
  }, [configuration]);

  return { githubConfig, ssoConfig };
};

export default useConfiguration;
