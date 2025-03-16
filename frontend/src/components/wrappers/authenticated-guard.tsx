import { useAppSelector } from "@/hooks/useStore";
import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedGuard: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);

  if (!isAuth) return <Navigate to="/" />;
  return <Outlet />;
};

export default AuthenticatedGuard;
