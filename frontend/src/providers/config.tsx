import { useAppDispatch } from "@/hooks/useStore";
import { setBackendUrl, setSocketUrl } from "@/services/configSlice";
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export interface Config {
  backendUrl: string;
  socketUrl: string;
}

export interface ConfigContextProps {
  config: Config;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ConfigContext = createContext<ConfigContextProps | undefined>(
  undefined
);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get<Config>("/config.json");
        setConfig(response.data);
        dispatch(setBackendUrl(response.data.backendUrl));
        dispatch(setSocketUrl(response.data.socketUrl));
      } catch (err) {
        setError(err as Error);
        console.error("Failed to load config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!config) {
    throw new Error("Config not loaded");
  }

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
