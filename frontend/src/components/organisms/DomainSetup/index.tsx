import {
  DomainResponseDto,
  useGetDomainStatusQuery,
  useDeleteDomainMutation,
} from "@/services/backendApi/domains";
import { FC } from "react";
import DomainNameForm from "./DomainNameForm";
import DomainSetupStep from "./DomainSetupStep";
import steps from "./domainSteps";
import DomainActions from "./DomainActions";

interface SetupDomainFormProps {
  domain?: DomainResponseDto;
  main?: boolean;
  onClose: () => void;
}
const SetupDomainForm: FC<SetupDomainFormProps> = ({
  domain,
  main,
  onClose,
}) => {
  const { data, refetch, isFetching } = useGetDomainStatusQuery(
    domain?.id ?? "",
    {
      skip: !domain,
    }
  );

  const [triggerDeleteDomain] = useDeleteDomainMutation();

  return (
    <div className="px-8 pt-1 space-y-6">
      {!domain && <DomainNameForm domain={domain} main={main} />}
      {steps.map((s) => (
        <DomainSetupStep
          key={s.title}
          step={s}
          domain={domain}
          completed={data?.[s.boolean] as boolean}
        />
      ))}
      <div className="flex space-x-2">
        <DomainActions
          isRefreshing={isFetching}
          onRefresh={refetch}
          onDelete={triggerDeleteDomain}
          onSave={onClose}
          status={data}
        />
      </div>
    </div>
  );
};

export default SetupDomainForm;
