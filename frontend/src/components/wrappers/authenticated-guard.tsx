import { useAppSelector } from "@/hooks/useStore";
import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedGuard: FC = () => {
  const { isAuth, setupStep } = useAppSelector((state) => state.auth);

  if (!isAuth) {
    if (setupStep === 0) return <Navigate to="/setup" />;
    return <Navigate to="/" />;
  } else return <Outlet />;
};

export default AuthenticatedGuard;
