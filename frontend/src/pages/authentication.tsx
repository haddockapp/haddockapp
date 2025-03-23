import AuthenticationOptions from "@/components/organisms/AuthenticationOptions";

import { useAppSelector } from "@/hooks/useStore";
import { FC } from "react";
import { Navigate } from "react-router-dom";

const Authentication: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);

  if (isAuth) return <Navigate to="/loading" />;

  return (
    <div>
      <div className="justify-center py-8 text-center">
        <div className="mx-auto w-36">
          <img className="rounded-full" src="./haddock.png" />
        </div>
        <h1 className="text-">Welcome back !</h1>
      </div>
      <div className="justify-between w-3/4 m-auto text-center space-y-8">
        <AuthenticationOptions />
      </div>
    </div>
  );
};

export default Authentication;
