import AuthenticationOptions from "@/components/organisms/AuthenticationOptions";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import { ChevronRight } from "lucide-react";
import { FC, useEffect } from "react";

const Account: FC = () => {
  const { isAuth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuth) dispatch(nextSetupStep());
  }, [dispatch, isAuth]);

  return (
    <>
      <AuthenticationOptions />
      <Button onClick={() => dispatch(nextSetupStep())} disabled={!isAuth}>
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Account;
