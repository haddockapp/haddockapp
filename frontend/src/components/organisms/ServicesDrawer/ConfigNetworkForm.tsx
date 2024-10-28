import { FC, useMemo } from "react";
import { ConfigNetworkFormType } from "./type.ts";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ServiceInformationDto } from "@/services/backendApi/services.ts";
import { useGetDomainsQuery } from "@/services/domain.ts";
import { Label } from "@/components/ui/label.tsx";
import { Autocomplete } from "@/components/molecules/autocomplete.tsx";
import { Input } from "@/components/ui/input.tsx";

interface ConfigNetworkFormProps {
  serviceInformations: ServiceInformationDto;
}

const ConfigNetworkForm: FC<ConfigNetworkFormProps> = ({
  serviceInformations,
}) => {
  const methods = useForm<ConfigNetworkFormType>({
    defaultValues: {
      port: "",
      domain: "",
      subdomain: "",
    },
  });

  const { handleSubmit, reset, register, control, watch } = methods;
  const { data: domains } = useGetDomainsQuery();
  console.log(domains);

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
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col justify-between space-y-2 w-1/2">
        <Label className="text-md">Port</Label>
        <Controller
          control={control}
          name="port"
          rules={{ required: true }}
          render={({ field }) => (
            <Autocomplete {...field} options={portOptions} />
          )}
        />
      </div>
      <div className="flex flex-row w-1/2 gap-2">
        <div className="flex flex-col w-1/3 space-y-2 mt-2">
          <Label className="text-md">Sub domain</Label>
          <Controller
            control={control}
            name="subdomain"
            rules={{
              required: true,
              pattern: {
                value: /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/,
                message: "Sub domain is invalid",
              },
            }}
            render={({ field }) => <Input {...field} disabled={!portValue} />}
          />
        </div>
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
      <div className="mt-4">
        <Label className="text-md">Domain visualizer</Label>
        <Input
          className="mt-2"
          value={`${subdomainValue}.${domainValue}`}
          disabled
        />
      </div>
    </form>
  );
};

export default ConfigNetworkForm;
