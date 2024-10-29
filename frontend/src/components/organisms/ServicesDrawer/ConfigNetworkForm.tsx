import { FC, useMemo } from "react";
import { ConfigNetworkFormType } from "./type.ts";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ServiceInformationDto } from "@/services/backendApi/services.ts";
import { useGetDomainsQuery } from "@/services/domain.ts";
import { Label } from "@/components/ui/label.tsx";
import { Autocomplete } from "@/components/molecules/autocomplete.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCreateNetworkConnectionMutation } from "@/services/backendApi/networks/networks.service.ts";
import { Button } from "@/components/ui/button.tsx";

interface ConfigNetworkFormProps {
  serviceInformations: ServiceInformationDto;
  projectId: string;
  onClose: () => void;
}

const ConfigNetworkForm: FC<ConfigNetworkFormProps> = ({
  serviceInformations,
  projectId,
  onClose,
}) => {
  const methods = useForm<ConfigNetworkFormType>({
    defaultValues: {
      port: "",
      domain: "",
      subdomain: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = methods;
  const { data: domains } = useGetDomainsQuery();
  const [createRedirection] = useCreateNetworkConnectionMutation();

  const portOptions = useMemo(
    () =>
      serviceInformations.ports.map((port) => ({
        label: port,
        value: port,
      })),
    [serviceInformations.ports]
  );

  const domainOptions = useMemo(
    () =>
      domains?.map((domain) => ({
        label: domain,
        value: domain,
      })) ?? [],
    [domains]
  );

  const portValue = watch("port");
  const domainValue = watch("domain");
  const subdomainValue = watch("subdomain");

  const onSubmit: SubmitHandler<ConfigNetworkFormType> = (data) => {
    createRedirection({
      projectId: projectId,
      port: parseInt(data.port),
      domain: `${subdomainValue}.${domainValue}`,
    });
    console.log(data);
    onClose();
  };

  const isSubmitDisabled = useMemo(() => {
    return Boolean(!portValue || !domainValue || errors.subdomain);
  }, [portValue, domainValue, errors.subdomain]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col justify-between space-y-2 w-1/3">
        <Label className="text-md">Port</Label>
        <Controller
          control={control}
          name="port"
          rules={{ required: "Port is required" }}
          render={({ field }) => (
            <Autocomplete {...field} options={portOptions} />
          )}
        />
      </div>
      <div className="flex flex-row w-full gap-1">
        <div className="flex flex-col w-1/3 space-y-2 mt-2">
          <Label className="text-md">Sub domain</Label>
          <Controller
            control={control}
            name="subdomain"
            rules={{
              pattern: {
                value: /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/,
                message: "Sub domain is invalid",
              },
            }}
            render={({ field }) => <Input {...field} disabled={!portValue} />}
          />
        </div>
        <p className="self-end">.</p>
        <div className="flex flex-col w-2/3 mt-2 space-y-2">
          <Label className="text-md">Domain</Label>
          <Controller
            control={control}
            name="domain"
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={
                  domainOptions.length
                    ? domainOptions
                    : [
                        {
                          label: "custom-domain.fr",
                          value: "custom-domain.fr",
                        },
                      ]
                }
                disabled={!portValue}
              />
            )}
          />
        </div>
      </div>
      {errors.subdomain && (
        <p className="text-red-500 text-sm mt-1">{errors.subdomain.message}</p>
      )}
      <div className="my-4">
        <Label className="text-md">Domain's overview</Label>
        <Input
          className="mt-2"
          value={`${subdomainValue}${subdomainValue ? "." : ""}${domainValue}`}
          disabled
        />
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitDisabled}>
        Create
      </Button>
    </form>
  );
};

export default ConfigNetworkForm;
