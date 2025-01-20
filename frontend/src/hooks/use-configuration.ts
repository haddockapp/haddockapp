import {
  useGetConfigurationQuery,
  ConfigurationType,
} from "@/services/backendApi/configuration";
import { useMemo } from "react";

const useConfiguration = () => {
  const { data: configuration } = useGetConfigurationQuery();
  const githubConfig = useMemo<{
    clientId: string;
    clientSecret: string;
  } | null>(() => {
    function getConfigurationValue(toFind: ConfigurationType) {
      const value = configuration?.find(({ key }) => key === toFind)?.value;
      if (!value) throw new Error(`Missing configuration value for ${toFind}`);

      return value;
    }

    try {
      return {
        clientId: getConfigurationValue(ConfigurationType.GITHUB_CLIENT_ID),
        clientSecret: getConfigurationValue(
          ConfigurationType.GITHUB_CLIENT_SECRET
        ),
      };
    } catch {
      return null;
    }
  }, [configuration]);

  return { githubConfig };
};

export default useConfiguration;
