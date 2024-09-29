import { Autocomplete } from "@/components/molecules/autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { FC, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { CreateProjectForm } from "./type";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectMutation } from "@/services/backendApi/projects";
import { Slider } from "@/components/ui/slider";

interface CreateProjectModalProps {
  onClose: () => void;
}
const CreateProjectModal: FC<CreateProjectModalProps> = ({ onClose }) => {
  const methods = useForm<CreateProjectForm>({
    defaultValues: {
      branch: "",
      repository: "",
      memory: 512,
      disk: 256,
      vcpus: 1,
      composeName: "compose.yml",
    },
  });
  const { handleSubmit, reset, register, control, watch } = methods;

  const [formStep, setFormStep] = useState<number>(0);

  const { toast } = useToast();

  const [createProject] = useCreateProjectMutation();

  const onSubmit: SubmitHandler<CreateProjectForm> = (data) => {
    switch (formStep) {
      case 0:
        setFormStep(1);
        break;
      case 1:
        createProject({
          repository_branch: data.branch,
          repository_name: data.repository.split("/")[1],
          repository_organisation: data.repository.split("/")[0],
          vm_cpus: data.vcpus,
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
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={[
                      { label: "Github", value: "github" },
                      { label: "Twitter", value: "twitter" },
                    ]}
                  />
                )}
              />
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label>Branch</Label>
              <Controller
                control={control}
                name="branch"
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={[{ label: "Github", value: "github" }]}
                  />
                )}
              />
            </div>
            <div className="flex flex-col justify-between space-y-1">
              <Label>Docker compose path</Label>
              <Input {...register("composeName", { required: true })} />
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
                min={512}
                max={8192}
                step={512}
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

export default CreateProjectModal;
