import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useDisclosure from "@/hooks/use-disclosure";
import { useUpdateProjectMutation } from "@/services/backendApi/projects";
import { FC, useEffect, useMemo } from "react";
import { Pencil } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import { useGetAllAuthorizationsQuery } from "@/services/backendApi/authorizations";
import {
  FormField,
  FormItem,
  FormControl,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "@/components/molecules/select";

const formSchema = z.object({
  authorization: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .required(),
  name: z.string(),
  description: z.string(),
});

interface EditProjectDialogProps {
  project: ProjectDto | undefined;
  isDisabled?: boolean;
}

const EditProjectDialog: FC<EditProjectDialogProps> = ({
  project,
  isDisabled,
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [editProject] = useUpdateProjectMutation();
  const { toast } = useToast();

  const { currentData: authorizations, isFetching: isFetchingAuthorizations } =
    useGetAllAuthorizationsQuery();

  const authorizationsOptions = useMemo(
    () =>
      authorizations?.map((authorization) => ({
        label: `${authorization.name} (${authorization.type})`,
        value: authorization.id,
      })) ?? [],
    [authorizations]
  );

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { handleSubmit, control } = methods;

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    editProject({
      projectId: project?.id ?? "",
      body: {
        name: data.name,
        description: data.description,
        authorization_id: data.authorization.value,
      },
    })
      .unwrap()
      .then(() => {
        toast({ title: "Project updated successfully", duration: 1000 });
        onClose();
      })
      .catch(() => {
        toast({
          title: "An error occurred",
          description: "Unable to update the project",
          duration: 1500,
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        authorization: authorizationsOptions.find(
          (authorization) =>
            authorization.value === project?.source.authorizationId
        ),
      });
    }
  }, [
    authorizationsOptions,
    isOpen,
    methods,
    project?.description,
    project?.name,
    project?.source.authorizationId,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger disabled={isDisabled} asChild>
        <Button variant="default" className="font-bold mt-4">
          <Pencil className="mr-2" size={15} />
          Edit this project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="self-center mb-2">
            {`Edit ${project?.name ?? "this project"}`}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-typography/60 text-sm">
          <Form {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Project name</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="description">Project description</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="authorization"
                render={({ field }) => (
                  <FormItem>
                    <Label>Authorization</Label>
                    <FormControl>
                      <Select
                        {...field}
                        isLoading={isFetchingAuthorizations}
                        options={authorizationsOptions}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="justify-between my-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-28"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Edit this project
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
