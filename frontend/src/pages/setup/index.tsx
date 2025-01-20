import { useAppSelector } from "@/hooks/useStore";
import { FC, useMemo } from "react";
import { Navigate } from "react-router-dom";
import Domains from "./steps/Domains";
import Stepdots from "@/components/molecules/stepdots";
import Welcome from "./steps/Welcome";
import StepTitle from "@/components/atoms/step-title";
import Account from "./steps/Account";

const stepHeaders: { title: string; description: string; Component: FC }[] = [
  {
    title: "Administrator account",
    description: "Create an administrator account to get started.",
    Component: Account,
  },
  {
    title: "Domain names",
    description: "Add your domain names.",
    Component: Domains,
  },
  {
    title: "Welcome !",
    description: "You're all set up !",
    Component: Welcome,
  },
];

const StepHeader: FC = () => {
  const { setupStep } = useAppSelector((state) => state.auth);

  const { title, description } = useMemo<{
    title: string;
    description: string;
  }>(() => stepHeaders[setupStep], [setupStep]);

  return (
    <div className="space-y-4">
      <Stepdots step={setupStep} total={stepHeaders.length} />
      <StepTitle
        step={setupStep + 1}
        total={stepHeaders.length}
        title={title}
      />
      <p className="text-gray-500 text-center">{description}</p>
    </div>
  );
};

const Setup: FC = () => {
  const { setupStep } = useAppSelector((state) => state.auth);

  const SetupComponent = useMemo<FC>(
    () =>
      setupStep < stepHeaders.length
        ? stepHeaders[setupStep].Component
        : () => <Navigate to="/dashboard" />,
    [setupStep]
  );

  return (
    <div className="justify-between w-3/4 m-auto text-center space-y-8">
      {setupStep < stepHeaders.length && <StepHeader />}
      <SetupComponent />
    </div>
  );
};

export default Setup;
