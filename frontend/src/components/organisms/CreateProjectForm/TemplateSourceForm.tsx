import Select from "@/components/molecules/select";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetTemplatesQuery } from "@/services/backendApi/templates";
import { useEffect, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";

function TemplateSourceForm() {
  const { data = [], isFetching } = useGetTemplatesQuery();
  const { control, watch, setValue } = useFormContext();

  const watchTemplateId = watch("templateId")?.value;
  const watchVersionId = watch("templateVersionId")?.value;

  const selectedTemplate = useMemo(
    () => data.find((template) => template.id === watchTemplateId),
    [data, watchTemplateId],
  );
  const selectedVersion = useMemo(
    () =>
      selectedTemplate?.versions.find(
        (version) => version.id === watchVersionId,
      ),
    [selectedTemplate, watchVersionId],
  );

  const templateOptions = useMemo(
    () =>
      data.map((template) => ({
        label: template.name,
        value: template.id,
      })) ?? [],
    [data],
  );
  const versionOptions = useMemo(
    () =>
      selectedTemplate?.versions.map((version) => ({
        label: version.label,
        value: version.id,
      })) ?? [],
    [selectedTemplate],
  );

  const canSelectVersions = Boolean(watchTemplateId);
  const variableList = useMemo(
    () => selectedVersion?.variables ?? [],
    [selectedVersion],
  );

  // Track previous template ID to detect changes
  const prevTemplateIdRef = useRef<string | undefined>(watchTemplateId);

  useEffect(() => {
    // If template changed, reset version and variables
    if (prevTemplateIdRef.current !== watchTemplateId) {
      setValue("templateVersionId", null);
      setValue("variables", {});
      prevTemplateIdRef.current = watchTemplateId;
      return;
    }

    // If version is no longer valid for the current template, reset it
    if (
      watchVersionId &&
      !versionOptions.map((o) => o.value).includes(watchVersionId)
    ) {
      setValue("templateVersionId", null);
      setValue("variables", {});
    }
  }, [watchTemplateId, versionOptions, watchVersionId, setValue]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="flex items-center gap-2">
                      {data.find((t) => t.id === option.value)?.icon && (
                        <img
                          src={data.find((t) => t.id === option.value)?.icon}
                          alt={`${option.label} icon`}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span>{option.label}</span>
                    </div>
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
                      ? "Select a version"
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
      </div>

      {variableList.length > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden bg-background/50">
          <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
            <h4 className="font-medium text-sm">Template Variables</h4>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {variableList.map((variable) => (
              <FormField
                key={variable.key}
                control={control}
                name={`variables.${variable.key}`}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {variable.label}
                    </Label>
                    <FormControl>
                      <Input
                        type={variable.type === "secret" ? "password" : "text"}
                        placeholder={`Enter ${variable.label}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateSourceForm;
