import { useAppSelector } from "@/hooks/useStore";
import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedGuard: FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  if (!token || token === "undefined") return <Navigate to="/" />;
  else return <Outlet />;
};

export default AuthenticatedGuard;
