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
  value: SourceType;
  onChangeValue: (value: SourceType) => void;
  isActive: boolean;
};

const SourceTypeCard: FC<SourceTypeCardProps> = ({
  icon,
  label,
  value,
  onChangeValue,
  isActive,
}) => (
  <Card
    onClick={() => onChangeValue(value)}
    className={twMerge(
      "p-2 md:p-8 flex flex-row items-center gap-2 text-typography/70",
      isActive
        ? "text-primary cursor-default"
        : "hover:text-primary cursor-pointer hover:shadow-md transition-shadow"
    )}
  >
    {icon}
    <span className="text-md md:text-xl">{label}</span>
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
const CreateProjectForm: FC<CreateProjectFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memory: 512,
      disk: 256,
      vcpus: 1,
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
        className="flex flex-col justify-between space-y-8 w-full"
      >
        <FormProvider {...form}>
          {formStep === 0 && (
            <MotionWrapper key="source-selection">
              <div className="flex flex-row items-center justify-around p-8">
                <Controller
                  control={control}
                  name="source"
                  render={({ field }) => (
                    <div className="flex flex-row items-center justify-around w-full gap-4">
                      <SourceTypeCard
                        icon={<FolderArchive className="shrink-0" />}
                        label="ZIP File"
                        value={SourceType.ZIP_UPLOAD}
                        onChangeValue={() => {
                          field.onChange(SourceType.ZIP_UPLOAD);
                          setFormStep(1);
                        }}
                        isActive={field.value === SourceType.ZIP_UPLOAD}
                      />
                      <SourceTypeCard
                        icon={<GitHubLogoIcon className="size-6 shrink-0" />}
                        label="GitHub"
                        value={SourceType.GITHUB}
                        onChangeValue={() => {
                          field.onChange(SourceType.GITHUB);
                          setFormStep(1);
                        }}
                        isActive={field.value === SourceType.GITHUB}
                      />
                      <SourceTypeCard
                        icon={<Presentation className="shrink-0" />}
                        label="Template"
                        value={SourceType.TEMPLATE}
                        onChangeValue={() => {
                          field.onChange(SourceType.TEMPLATE);
                          setFormStep(1);
                        }}
                        isActive={field.value === SourceType.TEMPLATE}
                      />
                      <SourceTypeCard
                        icon={
                          <SparklesIcon className="shrink-0 text-orange-200 fill-orange-100" />
                        }
                        label={<span>Deploy with AI</span>}
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
              {watchSourceType === SourceType.GITHUB && <GithubSourceForm />}
              {watchSourceType === SourceType.ZIP_UPLOAD && <ZipSourceForm />}
              {watchSourceType === SourceType.TEMPLATE && (
                <TemplateSourceForm />
              )}
              {watchSourceType === SourceType.AI && <AISourceForm />}
            </MotionWrapper>
          )}
          {formStep === 2 && (
            <MotionWrapper key="data-allocation-form">
              <DataAllocationForm />
            </MotionWrapper>
          )}
          {watchSourceType !== SourceType.AI && formStep > 0 && (
            <Button
              disabled={isLoading}
              type="submit"
              className="self-end w-full max-w-24"
            >
              {formStep !== 2 ? "Next" : "Create"}
            </Button>
          )}
        </FormProvider>
      </form>
    </Form>
  );
};

export default CreateProjectForm;
