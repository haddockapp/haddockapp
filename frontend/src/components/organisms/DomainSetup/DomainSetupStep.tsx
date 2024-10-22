import Haddot from "@/components/atoms/haddot";
import { toast } from "@/hooks/use-toast";
import { DomainResponseDto } from "@/services/backendApi/domains";
import { Copy } from "lucide-react";
import { FC } from "react";
import { SetupDomainStep } from "./domainSteps";

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
      <div className="flex items-center space-x-2">
        <div className="border-gray-200 border rounded-sm p-2 bg-gray-100 text-start min-w-80 min-h-8">
          <span className="text-gray-600">
            {domain?.[step.value] as string}
          </span>
        </div>
        {!!domain?.[step.value] && (
          <Copy
            onClick={() => {
              navigator.clipboard.writeText(domain?.[step.value] as string);
              toast({
                title: "Copied to clipboard",
                duration: 1000,
              });
            }}
            size="16px"
            className="text-primary cursor-pointer"
          />
        )}
      </div>
    </div>
  </div>
);

export default DomainSetupStep;
