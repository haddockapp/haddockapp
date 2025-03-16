import { FC } from "react";
import Domains from "./steps/Domains";
import Stepdots from "@/components/molecules/stepdots";
import Welcome from "./steps/Welcome";
import StepTitle from "@/components/atoms/step-title";
import useSetup from "@/hooks/use-setup";
import AuthenticationOptions from "@/components/organisms/AuthenticationOptions";

const steps: { title: string; description: string }[] = [
  {
    title: "Administrator account",
    description: "Create an administrator account to get started.",
  },
  {
    title: "Domain names",
    description: "Add your domain names.",
  },
  {
    title: "Welcome !",
    description: "You're all set up !",
  },
];

const stepsCount = Object.keys(steps).length;

const Setup: FC = () => {
  const { isAuthenticationStep, isDomainsStep, isSetupComplete, stepCount } =
    useSetup();

  return (
    <div className="justify-between w-3/4 m-auto text-center space-y-8">
      <div className="space-y-4">
        <Stepdots step={stepCount} total={stepsCount} />
        <StepTitle
          step={stepCount + 1}
          total={stepsCount}
          title={steps[stepCount].title}
        />
        <p className="text-gray-500 text-center">
          {steps[stepCount].description}
        </p>
      </div>
      {isAuthenticationStep ? (
        <AuthenticationOptions />
      ) : isDomainsStep ? (
        <Domains />
      ) : (
        isSetupComplete && <Welcome />
      )}
    </div>
  );
};

export default Setup;
