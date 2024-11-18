import Haddot from "@/components/atoms/haddot";
import { DomainResponseDto } from "@/services/backendApi/domains";
import { FC } from "react";
import { SetupDomainStep } from "./domainSteps";
import CopiableField from "@/components/molecules/copiable-field";

interface DomainSetupStepProps {
  domain?: DomainResponseDto;
  completed: boolean;
  step: SetupDomainStep;
}
const DomainSetupStep: FC<DomainSetupStepProps> = ({
  domain,
  completed,
  step,
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
      <CopiableField value={domain?.[step.value] as string} />
    </div>
  </div>
);

export default DomainSetupStep;
