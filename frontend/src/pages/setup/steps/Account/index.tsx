import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import { ChevronRight } from "lucide-react";
import { FC, useEffect } from "react";
import OrDivider from "@/components/molecules/or-divider";
import GithubAuthentication from "./GithubAuthentication";
import EmailAuthentication from "./EmailAuthentication";

const Account: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuth) dispatch(nextSetupStep());
  }, [dispatch, isAuth]);

  return (
    <>
      <div className="space-y-4 max-w-[400px] w-full mx-auto">
        <GithubAuthentication />
        <OrDivider />
        <EmailAuthentication />
      </div>
      <Button onClick={() => dispatch(nextSetupStep())} disabled={!isAuth}>
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Account;
