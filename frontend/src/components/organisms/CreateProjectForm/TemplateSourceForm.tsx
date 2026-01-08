import Select from "@/components/molecules/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetTemplatesQuery } from "@/services/backendApi/templates";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

function TemplateSourceForm() {
  const { data = [], isFetching } = useGetTemplatesQuery();
  const { control, watch, setValue } = useFormContext();

  const watchTemplateId = watch("templateId")?.value;
  const watchVersionId = watch("templateVersionId")?.value;

  const selectedTemplate = useMemo(
    () => data.find((template) => template.id === watchTemplateId),
    [data, watchTemplateId]
  );
  const selectedVersion = useMemo(
    () =>
      selectedTemplate?.versions.find(
        (version) => version.id === watchVersionId
      ),
    [selectedTemplate, watchVersionId]
  );

  const templateOptions = useMemo(
    () =>
      data.map((template) => ({
        label: template.name,
        value: template.id,
      })) ?? [],
    [data]
  );
  const versionOptions = useMemo(
    () =>
      selectedTemplate?.versions.map((version) => ({
        label: version.label,
        value: version.id,
      })) ?? [],
    [selectedTemplate]
  );

  const canSelectVersions = Boolean(watchTemplateId);
  const variableList = useMemo(
    () => selectedVersion?.variables ?? [],
    [selectedVersion]
  );

  useEffect(() => {
    if (versionOptions.map((o) => o.value).includes(watchVersionId)) return;
    setValue("templateVersionId", null);
  }, [versionOptions, watchVersionId, control, setValue]);

  return (
    <div className="flex flex-col justify-between space-y-4">
      <FormField
        control={control}
        name="templateId"
        render={({ field }) => (
          <FormItem>
            <Label>Template</Label>
            <FormControl>
              <Select
                {...field}
                formatOptionLabel={(option) => (
                  <>
                    <img
                      src={data.find((t) => t.id === option.value)?.icon}
                      alt={`${option.label} icon`}
                      className="inline-block w-6 h-6 mr-2"
                    />
                    {option.label}
                  </>
                )}
                isLoading={isFetching}
                options={templateOptions}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="templateVersionId"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
            <Label>Version</Label>
            <FormControl>
              <Select
                placeholder={
                  canSelectVersions
                    ? undefined
                    : "Please select a template first"
                }
                isLoading={isFetching}
                options={versionOptions}
                isDisabled={!canSelectVersions}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Accordion
        className={twMerge(variableList.length === 0 && "hidden")}
        type="single"
        value={variableList.length > 0 ? "variables" : undefined}
        disabled
        collapsible
      >
        <AccordionItem value="variables" className="border-none">
          <AccordionTrigger className="p-1 text-typography">
            Variables
          </AccordionTrigger>
          <AccordionContent className="p-1 flex flex-col gap-2 py-1">
            {variableList.map((variable) => (
              <FormField
                key={variable.key}
                control={control}
                name={`variables.${variable.key}`}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-typography/80">
                      {variable.label}
                    </Label>
                    <FormControl>
                      <Input
                        type={variable.type === "secret" ? "password" : "text"}
                        className="col-span-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default TemplateSourceForm;
