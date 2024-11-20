import { Autocomplete } from "@/components/molecules/autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { FC, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectMutation } from "@/services/backendApi/projects";
import { Slider } from "@/components/ui/slider";
import {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
} from "@/services/backendApi/github";

type Form = {
  repository: string;
  branch: string;
  memory: number;
  disk: number;
  vcpus: number;
  composeName: string;
};

interface CreateProjectFormProps {
  onClose: () => void;
}
const CreateProjectForm: FC<CreateProjectFormProps> = ({ onClose }) => {
  const { toast } = useToast();

  const methods = useForm<Form>({
    defaultValues: {
      branch: "",
      repository: "",
      memory: 512,
      disk: 256,
      vcpus: 1,
      composeName: "compose.yml",
    },
  });
  const {
    handleSubmit,
    reset,
    register,
    control,
    watch,
    formState: { errors },
  } = methods;

  const [formStep, setFormStep] = useState<number>(0);

  const [createProject] = useCreateProjectMutation();
  const { data: repositories } = useGetAllRepositoriesQuery();
  const { data: branches } = useGetAllBranchesByRepositoryQuery(
    watch("repository"),
    {
      skip: !watch("repository"),
    }
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

  const onSubmit: SubmitHandler<Form> = (data) => {
    switch (formStep) {
      case 0:
        setFormStep(1);
        break;
      case 1:
        createProject({
          repository_branch: data.branch,
          repository_name: data.repository.split("/")[1],
          repository_organisation: data.repository.split("/")[0],
          vm_cpus: +data.vcpus,
          vm_memory: +data.memory,
          vm_disk: +data.disk,
          compose_name: data.composeName,
        })
          .unwrap()
          .then(() => {
            toast({
              title: "Project created !",
              duration: 1000,
            });
            reset();
            onClose();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col justify-between space-y-8">
        {formStep === 0 && (
          <div className="flex flex-col justify-between space-y-4">
            <div className="flex flex-col justify-between space-y-1">
              <Label>Repository</Label>
              <Controller
                control={control}
                name="repository"
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete {...field} options={repositoriesOptions} />
                )}
              />
              {errors.repository && (
                <span className="text-red-600 text-xs">
                  {errors.repository && "This field is required"}
                </span>
              )}
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label>Branch</Label>
              <Controller
                control={control}
                name="branch"
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete {...field} options={branchesOptions} />
                )}
              />
              {errors.branch && (
                <span className="text-red-600 text-xs">
                  {errors.repository && "This field is required"}
                </span>
              )}
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label>Docker compose path</Label>
              <Input {...register("composeName", { required: true })} />
              {errors.composeName && (
                <span className="text-red-600 text-xs">
                  {errors.repository && "This field is required"}
                </span>
              )}
            </div>
          </div>
        )}
        {formStep === 1 && (
          <div className="flex flex-col justify-between space-y-6">
            <div className="flex flex-col justify-between space-y-1">
              <Label className="flex flex-row justify-between">
                <span>VCPUs</span>
                <span className="text-gray-400">{watch("vcpus")}</span>
              </Label>
              <Slider
                {...register("vcpus", { required: true })}
                min={1}
                max={8}
                step={1}
              />
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label className="flex flex-row justify-between">
                <span>RAM (MB)</span>
                <span className="text-gray-400">{watch("memory")} MB</span>
              </Label>
              <Slider
                {...register("memory", { required: true })}
                min={1024}
                max={8192}
                step={1024}
              />
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label className="flex flex-row justify-between">
                <span>Disk (MB)</span>
                <span className="text-gray-400">{watch("disk")} MB</span>
              </Label>
              <Slider
                {...register("disk", { required: true })}
                min={256}
                max={2048}
                step={256}
              />
            </div>
          </div>
        )}
        <Button type="submit">{formStep === 0 ? "Next" : "Create"}</Button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
