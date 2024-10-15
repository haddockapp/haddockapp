import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { setSetupStep } from "@/services/authSlice";
import { ChevronRight } from "lucide-react";
import { FC, useMemo } from "react";
import Account from "./steps/Account";
import { Navigate } from "react-router-dom";
import Domains from "./steps/Domains";
import Stepdots from "@/components/molecules/stepdots";
import { useGetAllDomainsQuery } from "@/services/backendApi/domains";

const StepHeader: FC = () => {
  const { setupStep } = useAppSelector((state) => state.auth);

  const { title, description } = useMemo<{
    title: string;
    description: string;
  }>(() => {
    if (setupStep === 0)
      return {
        title: "Administrator account",
        description: "Create an administrator account to get started.",
      };
    if (setupStep === 1)
      return { title: "Domain names", description: "Add your domain names." };
    return { title: "Welcome !", description: "You're all set up !" };
  }, [setupStep]);

  return (
    <div className="space-y-4">
      <Stepdots step={setupStep} total={3} />
      <div className="select-none justify-center flex items-center space-x-2">
        <h1 className="text-primary">
          <span className="text-3xl">{setupStep + 1}</span>
          <span className="text-2xl">/3</span>
        </h1>
        <h1 className="text-xs">●</h1>
        <h1 className="text-4xl">{title}</h1>
      </div>
      <p className="text-gray-500 text-center">{description}</p>
    </div>
  );
};

const Setup: FC = () => {
  const { isAuth, setupStep } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { data: domains } = useGetAllDomainsQuery();

  const SetupComponent = useMemo<FC>(() => {
    switch (setupStep) {
      case 0:
        return Account;
      case 1:
        return Domains;
      default:
        return () => <Navigate to="/dashboard" />;
    }
  }, [setupStep]);

  const isBlocked = useMemo<boolean>(() => {
    if (setupStep === 0) return !isAuth;
    if (setupStep === 1) return !(domains ?? []).some((d) => d.linked);
    return true;
  }, [domains, isAuth, setupStep]);

  return (
    <div className="justify-between w-3/4 m-auto text-center space-y-8">
      <StepHeader />
      <SetupComponent />
      <Button
        onClick={() => dispatch(setSetupStep(setupStep + 1))}
        disabled={isBlocked}
      >
        <ChevronRight />
        <span>Next</span>
      </Button>
    </div>
  );
};

export default Setup;
