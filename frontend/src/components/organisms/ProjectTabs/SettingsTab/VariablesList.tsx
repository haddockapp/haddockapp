import {
  useGetEnvironmentVariablesQuery,
  useCreateEnvironmentVariableMutation,
  useUpdateEnvironmentVariableMutation,
  useDeleteEnvironmentVariableMutation,
  EnvironmentVariableDto,
} from "@/services/backendApi/projects";
import { FC, useState } from "react";
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
    } catch (error) {
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
    updates: Partial<EnvironmentVariableDto>
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
      <h2 className="text-lg font-semibold text-gray-800">
        Environment Variables
      </h2>
      <p className="text-sm text-gray-600">
        Environment variables are used to configure the behavior of your
        application.
      </p>

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
    </div>
  );
};

export default VariablesList;
