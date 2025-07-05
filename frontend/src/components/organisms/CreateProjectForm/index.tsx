import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectMutation } from "@/services/backendApi/projects";
import { Slider } from "@/components/ui/slider";
import {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
} from "@/services/backendApi/github";
import {
  AuthorizationEnum,
  useGetAllAuthorizationsQuery,
} from "@/services/backendApi/authorizations";
import Select from "react-select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import CreateSelect from "@/components/molecules/create-select";

const formSchema = z.object({
  authorization: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
  repository: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .required(),
  branch: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .required(),
  memory: z.number().int().min(512).max(8192),
  disk: z.number().int().min(256).max(2048),
  vcpus: z.number().int().min(1).max(8),
  composePath: z.string(),
});

interface CreateProjectFormProps {
  onClose?: () => void;
}
const CreateProjectForm: FC<CreateProjectFormProps> = ({ onClose }) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memory: 512,
      disk: 256,
      vcpus: 1,
      composePath: "compose.yml",
    },
  });
  const { handleSubmit, reset, control, watch } = form;

  const [formStep, setFormStep] = useState<number>(0);

  const watchAuthorization = watch("authorization")?.value;
  const watchRepository = watch("repository")?.value;

  const { currentData: authorizations, isFetching: isFetchingAuthorizations } =
    useGetAllAuthorizationsQuery();

  const canFetchReposAndBranches = useMemo(() => {
    if (!watchAuthorization) return false;
    const authorization = authorizations?.find(
      (authorization) => authorization.id === watchAuthorization
    );
    if (!authorization) return false;
    return authorization?.type !== AuthorizationEnum.DEPLOY_KEY;
  }, [authorizations, watchAuthorization]);

  const { currentData: repositories, isFetching: isFetchingRepositories } =
    useGetAllRepositoriesQuery(
      {
        authorization: watchAuthorization!,
      },
      { skip: !watchAuthorization || !canFetchReposAndBranches }
    );
  const { currentData: branches, isFetching: isFetchingBranches } =
    useGetAllBranchesByRepositoryQuery(
      {
        repository: watchRepository,
        authorization: watchAuthorization!,
      },
      {
        skip: !watchRepository || !canFetchReposAndBranches,
      }
    );

  const [createProject] = useCreateProjectMutation();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    switch (formStep) {
      case 0:
        setFormStep(1);
        break;
      case 1:
        createProject({
          repository_branch: data.branch.value,
          repository_name: data.repository.value.split("/")[1],
          repository_organisation: data.repository.value.split("/")[0],
          vm_cpus: +data.vcpus,
          vm_memory: +data.memory,
          vm_disk: +data.disk,
          compose_path: data.composePath,
          authorization_id: data.authorization
            ? data.authorization?.value.length > 0
              ? data.authorization?.value
              : undefined
            : undefined,
        })
          .unwrap()
          .then(() => {
            toast({
              title: "Project created !",
              duration: 1000,
            });
            reset();
            onClose?.();
            setFormStep(0);
          })
          .catch(() => {
            toast({
              title: "An error occurred.",
              description: "Unable to create project",
              duration: 1500,
              variant: "destructive",
            });
          });
        break;
    }
  };

  const authorizationsOptions = useMemo(
    () =>
      authorizations?.map((authorization) => ({
        label: `${authorization.name} (${authorization.type})`,
        value: authorization.id,
      })) ?? [],
    [authorizations]
  );

  const repositoriesOptions = useMemo(
    () =>
      repositories?.map((repository) => ({
        label: repository.full_name,
        value: repository.full_name,
      })) ?? [],
    [repositories]
  );

  const branchesOptions = useMemo(
    () =>
      branches?.map((branch) => ({
        label: branch,
        value: branch,
      })) ?? [],
    [branches]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between space-y-8"
      >
        {formStep === 0 && (
          <div className="flex flex-col justify-between space-y-4">
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
                      options={[
                        { value: "", label: "N/A" },
                        ...authorizationsOptions,
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="repository"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <Label>Repository</Label>
                  <FormControl>
                    <CreateSelect
                      isLoading={isFetchingRepositories}
                      options={repositoriesOptions}
                      isSelect={canFetchReposAndBranches}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="branch"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <Label>Branch</Label>
                  <FormControl>
                    <CreateSelect
                      isLoading={isFetchingBranches}
                      isDisabled={!watch("repository")}
                      options={branchesOptions}
                      isSelect={canFetchReposAndBranches}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="composePath"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <Label>Docker compose path</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {formStep === 1 && (
          <div className="flex flex-col justify-between space-y-6">
            <FormField
              control={control}
              name="vcpus"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="flex justify-between">
                    <span>CPUs</span>
                    <span className="text-gray-400">{field.value}</span>
                  </Label>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      min={1}
                      max={8}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="memory"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Memory</span>
                    <span className="text-gray-400">{field.value} MB</span>
                  </Label>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      min={1024}
                      max={8192}
                      step={1024}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="disk"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Disk</span>
                    <span className="text-gray-400">{field.value} MB</span>
                  </Label>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([v]) => field.onChange(v)}
                      min={256}
                      max={2048}
                      step={256}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <Button type="submit">{formStep === 0 ? "Next" : "Create"}</Button>
      </form>
    </Form>
  );
};

export default CreateProjectForm;
