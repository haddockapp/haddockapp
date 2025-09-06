import { HaddockLoader } from "@/components/atoms/spinner";
import useSetup from "@/hooks/use-setup";
import { useAppSelector } from "@/hooks/useStore";
import { useGetSelfQuery } from "@/services/backendApi/users";
import { FC } from "react";
import { Navigate } from "react-router-dom";

const LoadingPage: FC = () => {
  const { isSetupComplete, isLoading } = useSetup();

  useGetSelfQuery(); // if this returns an unauthorized error, it will trigger a logout in the base query
  const { isAuth } = useAppSelector((state) => state.auth);

  if (!isAuth) return <Navigate to="/" />;

  if (isLoading) return <HaddockLoader />;

  if (!isSetupComplete) return <Navigate to="/setup?step=domains" />;

  return <Navigate to="/workspaces" />;
};

export default LoadingPage;
