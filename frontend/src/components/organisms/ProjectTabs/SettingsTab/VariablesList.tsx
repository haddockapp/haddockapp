import {
  useGetEnvironmentVariablesQuery,
  useCreateEnvironmentVariableMutation,
  useUpdateEnvironmentVariableMutation,
  useDeleteEnvironmentVariableMutation,
  EnvironmentVariableDto,
} from "@/services/backendApi/projects";
import { FC, useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import SwitchWithText from "@/components/molecules/text-switch";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, X } from "lucide-react";

const formSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  isSecret: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VariablesListProps {
  projectId: string;
}

const VariablesList: FC<VariablesListProps> = ({ projectId }) => {
  const { data: variables } = useGetEnvironmentVariablesQuery(projectId);
  const [triggerCreate] = useCreateEnvironmentVariableMutation();
  const [triggerUpdate] = useUpdateEnvironmentVariableMutation();
  const [triggerDelete] = useDeleteEnvironmentVariableMutation();
  const { toast } = useToast();

  const [editedVariables, setEditedVariables] = useState<
    Record<string, Partial<EnvironmentVariableDto>>
  >({});

  // Bulk edit mode statehead
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Initialize bulk edit value when entering bulk mode (excluding secrets)
  useEffect(() => {
    if (isBulkEditMode && variables) {
      setBulkEditValue(
        variables
          .filter((v) => !v.isSecret)
          .map((v) => `${v.key}=${v.value}`)
          .join("\n"),
      );
    }
  }, [isBulkEditMode, variables]);

  // Parse .env format to variables
  const parseEnvFormat = (text: string): { key: string; value: string }[] => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const parsed: { key: string; value: string }[] = [];

    for (const line of lines) {
      // Skip comments
      if (line.trim().startsWith("#")) continue;

      const equalsIndex = line.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = line.substring(0, equalsIndex).trim();
      const value = line.substring(equalsIndex + 1).trim();

      if (key) {
        parsed.push({ key, value });
      }
    }

    return parsed;
  };

  // Handle bulk save
  const handleBulkSave = async () => {
    setIsBulkSaving(true);

    try {
      const newVariables = parseEnvFormat(bulkEditValue);
      // Only consider non-secret variables for bulk operations
      const nonSecretVariables = variables?.filter((v) => !v.isSecret) || [];
      const existingNonSecretKeys = new Set(
        nonSecretVariables.map((v) => v.key),
      );
      const newKeys = new Set(newVariables.map((v) => v.key));

      // Find variables to delete (exist in current non-secrets but not in new)
      const toDelete = nonSecretVariables.filter((v) => !newKeys.has(v.key));

      // Find variables to create (exist in new but not in current non-secrets)
      const toCreate = newVariables.filter(
        (v) => !existingNonSecretKeys.has(v.key),
      );

      // Find variables to update (exist in both non-secrets)
      const toUpdate = newVariables.filter((v) => {
        if (!existingNonSecretKeys.has(v.key)) return false;
        const existing = nonSecretVariables.find((e) => e.key === v.key);
        return existing?.value !== v.value;
      });

      // Execute all operations
      const operations: Promise<any>[] = [];

      for (const variable of toDelete) {
        operations.push(
          triggerDelete({ projectId, key: variable.key }).unwrap(),
        );
      }

      for (const variable of toCreate) {
        operations.push(
          triggerCreate({
            projectId,
            body: { key: variable.key, value: variable.value, isSecret: false },
          }).unwrap(),
        );
      }

      for (const variable of toUpdate) {
        operations.push(
          triggerUpdate({
            projectId,
            key: variable.key,
            body: { key: variable.key, value: variable.value, isSecret: false },
          }).unwrap(),
        );
      }

      await Promise.all(operations);

      toast({
        title: "Bulk update complete",
        description: `Created ${toCreate.length}, updated ${toUpdate.length}, deleted ${toDelete.length} variables.`,
      });

      setIsBulkEditMode(false);
    } catch (error: any) {
      toast({
        title: "Error during bulk update",
        description: error.message || "Some operations may have failed.",
        variant: "destructive",
      });
    } finally {
      setIsBulkSaving(false);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
      isSecret: false,
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    triggerCreate({
      projectId,
      body: {
        key: data.key,
        value: data.value,
        isSecret: data.isSecret ?? false,
      },
    })
      .unwrap()
      .then(() => {
        toast({
          title: "Environment variable created",
          description: "Variable added successfully.",
        });
        form.reset();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleUpdate = async (original: EnvironmentVariableDto) => {
    const edited = editedVariables[original.key];
    if (!edited) return;

    const hasChanged =
      (edited.key !== undefined && edited.key !== original.key) ||
      (edited.value !== undefined && edited.value !== original.value) ||
      (edited.isSecret !== undefined && edited.isSecret !== original.isSecret);

    if (!hasChanged) return;

    try {
      await triggerUpdate({
        projectId,
        key: original.key,
        body: {
          key: edited.key ?? original.key,
          value: edited.value ?? original.value,
          isSecret: edited.isSecret ?? original.isSecret,
        },
      }).unwrap();
      toast({
        title: "Updated",
        description: `Variable ${original.key} updated.`,
      });
      setEditedVariables((prev) => {
        const newState = { ...prev };
        delete newState[original.key];
        return newState;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUndo = (key: string) => {
    setEditedVariables((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const handleDelete = (key: string) => {
    triggerDelete({ projectId, key })
      .unwrap()
      .then(() => {
        toast({
          title: "Deleted",
          description: `Variable ${key} deleted.`,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const updateEditedVariable = (
    key: string,
    updates: Partial<EnvironmentVariableDto>,
  ) => {
    setEditedVariables((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  return (
    <div className="flex-col space-y-4">
      {/* Bulk Edit Mode Toggle */}
      <div className="flex items-center justify-between">
        <SwitchWithText
          id="bulk-edit-mode"
          text="Bulk Edit"
          checked={isBulkEditMode}
          onCheckedChange={(checked) => {
            setIsBulkEditMode(checked);
            if (!checked) {
              setBulkEditValue("");
            }
          }}
        />
        {isBulkEditMode && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Use KEY=VALUE format, one per line</span>
          </div>
        )}
      </div>

      {isBulkEditMode ? (
        /* Bulk Edit Mode */
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={bulkEditValue}
              onChange={(e) => setBulkEditValue(e.target.value)}
              placeholder={`# Environment Variables\n# Format: KEY=VALUE\n# Lines starting with # are comments\n\nDATABASE_URL=postgres://localhost:5432/mydb\nAPI_KEY=your-api-key-here`}
              className="min-h-[300px] font-mono text-sm resize-y"
              disabled={isBulkSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Secret variables are excluded from bulk edit and will remain
              unchanged.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBulkEditMode(false);
                  setBulkEditValue("");
                }}
                disabled={isBulkSaving}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBulkSave}
                disabled={isBulkSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isBulkSaving ? "Saving..." : "Save All"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Table Mode */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-center">Secret</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables?.map((variable) => {
                  const edited = editedVariables[variable.key] || {};
                  const isDirty =
                    (edited.key !== undefined && edited.key !== variable.key) ||
                    (edited.value !== undefined &&
                      edited.value !== variable.value) ||
                    (edited.isSecret !== undefined &&
                      edited.isSecret !== variable.isSecret);

                  return (
                    <TableRow key={variable.key}>
                      <TableCell>
                        <Input
                          value={edited.key ?? variable.key}
                          onChange={(e) =>
                            updateEditedVariable(variable.key, {
                              key: e.target.value,
                            })
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={edited.value ?? variable.value}
                          onChange={(e) =>
                            updateEditedVariable(variable.key, {
                              value: e.target.value,
                            })
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <Checkbox
                          checked={edited.isSecret ?? variable.isSecret}
                          disabled={variable.isSecret}
                          onCheckedChange={(checked) =>
                            updateEditedVariable(variable.key, {
                              isSecret: checked === true,
                            })
                          }
                          className="w-4 h-4"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            type="button"
                            className="h-8 px-3 text-sm"
                            onClick={() => handleUpdate(variable)}
                            disabled={!isDirty}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            className="h-8 px-3 text-sm"
                            onClick={() => handleUndo(variable.key)}
                            disabled={!isDirty}
                          >
                            Undo
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="destructive"
                            className="h-8 px-3 text-sm"
                            onClick={() => handleDelete(variable.key)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell className="w-[550px]">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem className="m-0">
                          <Input
                            {...field}
                            placeholder="Key"
                            className="h-8 text-sm w-full min-h-[2rem] leading-8 border [&_.peer:disabled]:opacity-100 mb-2"
                          />
                          <FormMessage className="text-xs mt-4 min-w-[100px]" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="w-[550px]">
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem className="m-0">
                          <Input
                            {...field}
                            placeholder="Value"
                            className="h-8 text-sm w-full mb-2"
                          />
                          <FormMessage className="text-xs mt-4 min-w-[100px]" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Controller
                      name="isSecret"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ?? false)
                          }
                          className="w-4 h-4"
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="submit" className="h-8 px-3 text-sm">
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </form>
        </Form>
      )}
    </div>
  );
};

export default VariablesList;
