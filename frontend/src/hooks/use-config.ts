import { ConfigContext, ConfigContextProps } from "@/providers/config";
import { useContext } from "react";

export default (): ConfigContextProps => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
