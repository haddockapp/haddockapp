import { HaddockLoader } from "@/components/atoms/spinner";
import useSetup from "@/hooks/use-setup";
import { useAppSelector } from "@/hooks/useStore";
import { FC } from "react";
import { Navigate } from "react-router-dom";

const LoadingPage: FC = () => {
  const { isSetupComplete, isLoading } = useSetup();

  const { isAuth } = useAppSelector((state) => state.auth);

  if (isLoading || !isAuth) return <HaddockLoader />;

  if (!isSetupComplete) return <Navigate to="/setup?step=domains" />;

  return <Navigate to="/dashboard" />;
};

export default LoadingPage;
