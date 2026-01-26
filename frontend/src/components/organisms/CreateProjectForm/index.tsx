import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectMutation } from "@/services/backendApi/projects";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import {
  AITools,
  SourceType,
} from "@/services/backendApi/projects/sources.dto";
import { Card } from "@/components/ui/card";
import { FolderArchive, Presentation, SparklesIcon } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import GithubSourceForm from "./GithubSourceForm";
import DataAllocationForm from "./DataAllocationForm";
import ZipSourceForm from "./ZipSourceForm";
import TemplateSourceForm from "./TemplateSourceForm";
import { useAppDispatch } from "@/hooks/useStore";
import { backendApi, QueryKeys } from "@/services/backendApi";
import AISourceForm from "./AISourceForm";

const MotionWrapper: FC<{ children: React.ReactNode; key: string }> = ({
  key,
  children,
}) => (
  <motion.div
    key={key}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

type SourceTypeCardProps = {
  icon: React.ReactNode;
  label: React.ReactNode;
  description?: string;
  value: SourceType;
  onChangeValue: (value: SourceType) => void;
  isActive: boolean;
};

const SourceTypeCard: FC<SourceTypeCardProps> = ({
  icon,
  label,
  description,
  value,
  onChangeValue,
  isActive,
}) => (
  <Card
    onClick={() => onChangeValue(value)}
    className={twMerge(
      "p-6 flex flex-col items-center justify-center gap-4 text-center h-[200px] relative overflow-hidden transition-all duration-300 group hover:shadow-lg border-2",
      isActive
        ? "border-primary bg-primary/5 shadow-md"
        : "border-transparent hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
    )}
  >
    <div
      className={twMerge(
        "p-3 rounded-full bg-background shadow-sm transition-transform duration-300 group-hover:scale-110",
        isActive && "bg-primary/20",
      )}
    >
      {icon}
    </div>
    <div className="space-y-1">
      <h4
        className={twMerge(
          "font-semibold text-lg transition-colors",
          isActive ? "text-primary" : "text-foreground",
        )}
      >
        {label}
      </h4>
      {description && (
        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {description}
        </p>
      )}
    </div>
    {isActive && (
      <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary animate-pulse" />
    )}
  </Card>
);

const formSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal(SourceType.GITHUB),
    composePath: z.string(),
    authorization: z.object({ label: z.string(), value: z.string() }),
    repository: z.object({ label: z.string(), value: z.string() }),
    branch: z.object({ label: z.string(), value: z.string() }),
    variables: z.record(z.string()).optional(),
    memory: z.number().int().min(512).max(8192),
    disk: z.number().int().min(256).max(2048),
    vcpus: z.number().int().min(1).max(8),
  }),
  z.object({
    source: z.literal(SourceType.ZIP_UPLOAD),
    composePath: z.string(),
    variables: z.record(z.string()).optional(),
    memory: z.number().int().min(512).max(8192),
    disk: z.number().int().min(256).max(2048),
    vcpus: z.number().int().min(1).max(8),
  }),
  z.object({
    source: z.literal(SourceType.TEMPLATE),
    templateId: z.object({ label: z.string(), value: z.string() }),
    templateVersionId: z.object({ label: z.string(), value: z.string() }),
    variables: z.record(z.string()).optional(),
    memory: z.number().int().min(512).max(8192),
    disk: z.number().int().min(256).max(2048),
    vcpus: z.number().int().min(1).max(8),
  }),
  z.object({
    source: z.literal(SourceType.AI),
    tool: z.nativeEnum(AITools),
  }),
]);

interface CreateProjectFormProps {
  onClose?: () => void;
}
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: "Source", value: 0 },
    { label: "Details", value: 1 },
    { label: "Resources", value: 2 },
  ];

  return (
    <div className="flex flex-row items-center justify-between w-full mb-8 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10 transform -translate-y-1/2" />
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transform -translate-y-1/2 transition-all duration-500 ease-in-out"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
        }}
      />
      {steps.map((step, index) => (
        <div
          key={step.value}
          className="flex flex-col items-center gap-2 bg-background px-2"
        >
          <div
            className={twMerge(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300",
              index <= currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : "border-secondary bg-background text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          <span
            className={twMerge(
              "text-xs font-medium transition-colors duration-300",
              index <= currentStep ? "text-primary" : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const CreateProjectForm: FC<CreateProjectFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memory: 2048,
      disk: 512,
      vcpus: 2,
      composePath: "compose.yml",
    },
  });
  const { handleSubmit, reset, watch, control } = form;

  const [formStep, setFormStep] = useState<number>(0);

  const [createProject, { isLoading }] = useCreateProjectMutation();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    switch (formStep) {
      case 0:
        setFormStep(1);
        break;
      case 1:
        if (data.source === SourceType.AI) {
          onClose?.();
          dispatch(backendApi.util.invalidateTags([QueryKeys.Projects]));
          setFormStep(0);
        } else setFormStep(2);
        break;
      case 2:
        if (data.source === SourceType.AI) {
          onClose?.();
          dispatch(backendApi.util.invalidateTags([QueryKeys.Projects]));
          setFormStep(0);
        } else
          createProject({
            vm_cpus: +data.vcpus,
            vm_memory: +data.memory,
            vm_disk: +data.disk,
            source:
              data.source === SourceType.ZIP_UPLOAD
                ? {
                    type: SourceType.ZIP_UPLOAD,
                    compose_path: data.composePath,
                  }
                : data.source === SourceType.TEMPLATE
                  ? {
                      type: SourceType.TEMPLATE,
                      templateId: data.templateId!.value,
                      versionId: data.templateVersionId!.value,
                      variables: data.variables!,
                    }
                  : {
                      type: SourceType.GITHUB,
                      authorization_id: data.authorization
                        ? data.authorization?.value.length > 0
                          ? data.authorization?.value
                          : undefined
                        : undefined,
                      branch: data.branch!.value,
                      organization: data.repository!.value.split("/")[0],
                      repository: data.repository!.value.split("/")[1],
                      compose_path: data.composePath,
                    },
          })
            .unwrap()
            .then((res) => {
              toast({ title: "Project created !", duration: 1000 });
              reset();
              onClose?.();
              navigate(`/project/${res.id}`);
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

  const watchSourceType = watch("source");

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between space-y-8 w-full h-full"
      >
        <div className="flex flex-col gap-6">
          {watchSourceType !== SourceType.AI && (
            <Stepper currentStep={formStep} />
          )}

          <FormProvider {...form}>
            {formStep === 0 && (
              <MotionWrapper key="source-selection">
                <div className="flex flex-col gap-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">
                      How do you want to start?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a source for your new project
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="source"
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SourceTypeCard
                          icon={
                            <FolderArchive className="size-8 shrink-0 text-orange-500" />
                          }
                          label="From ZIP File"
                          description="Upload a compressed project file directly"
                          value={SourceType.ZIP_UPLOAD}
                          onChangeValue={() => {
                            field.onChange(SourceType.ZIP_UPLOAD);
                            setFormStep(1);
                          }}
                          isActive={field.value === SourceType.ZIP_UPLOAD}
                        />
                        <SourceTypeCard
                          icon={
                            <GitHubLogoIcon className="size-8 shrink-0 text-gray-900 dark:text-gray-100" />
                          }
                          label="Import from GitHub"
                          description="Connect your repository"
                          value={SourceType.GITHUB}
                          onChangeValue={() => {
                            field.onChange(SourceType.GITHUB);
                            setFormStep(1);
                          }}
                          isActive={field.value === SourceType.GITHUB}
                        />
                        <SourceTypeCard
                          icon={
                            <Presentation className="size-8 shrink-0 text-blue-500" />
                          }
                          label="Use a Template"
                          description="Start from a pre-built template"
                          value={SourceType.TEMPLATE}
                          onChangeValue={() => {
                            field.onChange(SourceType.TEMPLATE);
                            setFormStep(1);
                          }}
                          isActive={field.value === SourceType.TEMPLATE}
                        />
                        <SourceTypeCard
                          icon={
                            <SparklesIcon className="size-8 shrink-0 text-purple-500" />
                          }
                          label="Generate with AI"
                          description="Let AI build your project structure"
                          value={SourceType.AI}
                          onChangeValue={() => {
                            field.onChange(SourceType.AI);
                            setFormStep(1);
                          }}
                          isActive={field.value === SourceType.AI}
                        />
                      </div>
                    )}
                  />
                </div>
              </MotionWrapper>
            )}
            {formStep === 1 && (
              <MotionWrapper key="source-form">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">
                      Configure Source Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Provide the necessary information for your chosen source
                    </p>
                  </div>
                  <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                    {watchSourceType === SourceType.GITHUB && (
                      <GithubSourceForm />
                    )}
                    {watchSourceType === SourceType.ZIP_UPLOAD && (
                      <ZipSourceForm />
                    )}
                    {watchSourceType === SourceType.TEMPLATE && (
                      <TemplateSourceForm />
                    )}
                    {watchSourceType === SourceType.AI && <AISourceForm />}
                  </div>
                </div>
              </MotionWrapper>
            )}
            {formStep === 2 && (
              <MotionWrapper key="data-allocation-form">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">
                      Resource Allocation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Define the resources for your project
                    </p>
                  </div>
                  <DataAllocationForm />
                </div>
              </MotionWrapper>
            )}
          </FormProvider>
        </div>

        {watchSourceType !== SourceType.AI && formStep > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setFormStep((prev) => prev - 1)}
              type="button"
            >
              Back
            </Button>
            <Button disabled={isLoading} type="submit" className="min-w-24">
              {formStep !== 2 ? "Next" : "Create Project"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default CreateProjectForm;
