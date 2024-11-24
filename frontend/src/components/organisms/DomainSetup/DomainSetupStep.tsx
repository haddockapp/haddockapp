import Haddot from "@/components/atoms/haddot";
import { FC } from "react";
import { SetupDomainStep } from "./domainSteps";
import CopiableField from "@/components/molecules/copiable-field";

interface DomainSetupStepProps {
  completed: boolean;
  step: SetupDomainStep;
  value: string;
}
const DomainSetupStep: FC<DomainSetupStepProps> = ({
  completed,
  step,
  value,
}) => (
  <div className="flex space-x-4">
    <div className="flex h-fit mx-auto mt-4">
      <Haddot completed={completed} />
    </div>
    <div className="space-y-2 w-full">
      <div className="text-start">
        <h1 className="text-lg text-gray-700">{step.title}</h1>
        <p className="text-gray-400">{step.subtitle}</p>
      </div>
      <CopiableField value={value} />
    </div>
  </div>
);

export default DomainSetupStep;
