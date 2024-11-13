import {
  DomainResponseDto,
  useGetDomainStatusQuery,
  useDeleteDomainMutation,
  useApplyDomainMutation,
} from "@/services/backendApi/domains";
import { FC, useCallback } from "react";
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

  const [triggerApplyDommain, { isLoading: isApplying }] =
    useApplyDomainMutation();
  const [triggerDeleteDomain, { isLoading: isDeleting }] =
    useDeleteDomainMutation();

  const handleSave = useCallback(
    () =>
      triggerApplyDommain()
        .unwrap()
        .then(() => onClose()),
    [onClose, triggerApplyDommain]
  );

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
          isMutating={isApplying || isDeleting}
          onRefresh={refetch}
          onDelete={triggerDeleteDomain}
          onSave={handleSave}
          status={data}
        />
      </div>
    </div>
  );
};

export default SetupDomainForm;
