import { type FC, useState } from "react";
import { VmState } from "@/types/vm/vm";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectActionButton from "./ProjectActionButton";
import { useToast } from "@/hooks/use-toast";
import {
  useStartProjectMutation,
  useStopProjectMutation,
  usePullProjectMutation,
  useRecreateProjectMutation,
} from "@/services/backendApi/projects";
import { Play, Square, RefreshCw, RotateCcw, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import ProjectActionConfirmDialog from "./ProjectActionConfirmDialog";
import { QueryKeys, backendApi } from "@/services/backendApi";
import { useAppDispatch } from "@/hooks/useStore";
import useMetrics from "@/hooks/use-metrics";
import { ProjectTabsValue } from "@/pages/project/projectTabsType";
import { SourceType } from "@/services/backendApi/projects/sources.dto";
import SimpleDialog from "../SimpleDialog";
import UploadZipDialog from "../UploadZipDialog";
import { useGetFindingsQuery } from "@/services/backendApi/security/security";
import SecuritySummaryBar from "./SecuritySummaryBar";

interface ProjectManagementPanelProps {
  project: ProjectDto;
  onChangeTab: (tab: ProjectTabsValue) => void;
}

type ActionType = "start" | "stop" | "pull" | "recreate" | "reupload" | null;

const ProjectManagementPanel: FC<ProjectManagementPanelProps> = ({
  project,
  onChangeTab,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [startProject, { isLoading: isStartingMutation }] =
    useStartProjectMutation();
  const [stopProject, { isLoading: isStopLoading }] = useStopProjectMutation();
  const [pullProject, { isLoading: isPulling }] = usePullProjectMutation();
  const [recreateProject, { isLoading: isRecreating }] =
    useRecreateProjectMutation();

  const projectStatus = project.vm.status;
  const isRunning = projectStatus === VmState.Running;
  const isStopped = projectStatus === VmState.Stopped;
  const isStarting = projectStatus === VmState.Starting;
  const isStopping = projectStatus === VmState.Stopping;
  const isError = !isRunning && !isStopped && !isStarting;

  const isLoading =
    isStartingMutation || isStopLoading || isPulling || isRecreating;

  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);

    if (action === "start") {
      executeAction(action);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const executeAction = async (action: ActionType) => {
    if (!action) return;

    try {
      switch (action) {
        case "start":
          await startProject(project.id).unwrap();
          toast({
            title: "Project starting",
            description:
              "Your project is now starting. This may take a few moments.",
          });
          break;
        case "stop":
          await stopProject(project.id).unwrap();
          toast({
            title: "Project stopped",
            description: "Your project has been stopped successfully.",
          });
          break;
        case "reupload":
          break;
        case "pull":
          await pullProject(project.id).unwrap();
          setTimeout(() => {
            dispatch(backendApi.util.invalidateTags([QueryKeys.Projects]));
          }, 1000);
          toast({
            title: "Project updated",
            description:
              "Your project is being updated with the latest source code.",
          });
          break;
        case "recreate":
          await recreateProject(project.id).unwrap();
          setTimeout(() => {
            dispatch(backendApi.util.invalidateTags([QueryKeys.Projects]));
          }, 1000);
          toast({
            title: "Project recreating",
            description:
              "Your project is being recreated. This may take a few moments.",
          });
          break;
      }
    } catch {
      toast({
        title: "Action failed",
        description: `Failed to ${action} the project. Please try again later.`,
        variant: "destructive",
      });
    } finally {
      setConfirmDialogOpen(false);
      setCurrentAction(null);
    }
  };

  const getDialogConfig = () => {
    switch (currentAction) {
      case "stop":
        return {
          title: "Stop Project",
          description:
            "Are you sure you want to stop this project? All services will be unavailable until you start it again.",
          confirmLabel: "Stop Project",
          icon: <Square className="h-5 w-5 text-red-600" />,
          isDestructive: true,
        };
      case "reupload":
        return null;
      case "pull":
        return {
          title: "Update Project",
          description:
            "This will pull the latest source code for your project. Any local changes may be lost.",
          confirmLabel: "Update Project",
          icon: <RefreshCw className="h-5 w-5" />,
          isDestructive: false,
        };
      case "recreate":
        return {
          title: "Recreate Project",
          description:
            "This will completely recreate your project VM and redeploy the source. This is a destructive action and may take some time.",
          confirmLabel: "Recreate Project",
          icon: <RotateCcw className="h-5 w-5 text-red-600" />,
          isDestructive: true,
        };
      default:
        return null;
    }
  };

  const dialogConfig = getDialogConfig();

  const { buildLogs, isAlert } = useMetrics();
  const { data: securityData } = useGetFindingsQuery(project.id);

  return (
    <>
      {project.source.type === SourceType.ZIP_UPLOAD &&
        "status" in project.source.settings && (
          <SimpleDialog
            isOpen={currentAction === "reupload"}
            onOpen={() => {}}
            onClose={() => setCurrentAction(null)}
            title="Upload a ZIP file"
            description="Drag and drop or browse to upload a ZIP file containing your project."
            Content={UploadZipDialog}
          />
        )}

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-typography">
                Project Management
              </CardTitle>
              <CardDescription>
                Manage the lifecycle of your project
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ProjectStatusBadge
                isAlert={isAlert}
                onClick={() => onChangeTab(ProjectTabsValue.Monitoring)}
                tooltip={buildLogs.length > 0 ? "View build logs" : undefined}
                status={projectStatus}
                size="lg"
              />
              <SecuritySummaryBar findings={securityData?.findings ?? []} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <ProjectActionButton
              label="Start"
              icon={<Play className="h-4 w-4" />}
              onClick={() => handleActionClick("start")}
              isDisabled={isRunning || isStarting || isLoading || isStopping}
              disabledReason={
                isRunning
                  ? "Project is already running"
                  : isStarting
                    ? "Project is currently starting"
                    : isLoading
                      ? "Another action is in progress"
                      : isStopping
                        ? "Project is currently stopping"
                        : undefined
              }
              variant="default"
              isLoading={currentAction === "start" && isStartingMutation}
            />

            <ProjectActionButton
              label="Stop"
              icon={<Square className="h-4 w-4" />}
              onClick={() => handleActionClick("stop")}
              isDisabled={!isRunning || isLoading || isStopping}
              disabledReason={
                !isRunning
                  ? "Project must be running to stop it"
                  : isLoading
                    ? "Another action is in progress"
                    : isStopping
                      ? "Project is currently stopping"
                      : undefined
              }
              variant="outline"
              isLoading={currentAction === "stop" && isStopping}
            />

            {project.source.type === SourceType.ZIP_UPLOAD && (
              <ProjectActionButton
                label="Reupload"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => handleActionClick("reupload")}
                isDisabled={(!isStopped && !isError) || isLoading || isStopping}
                disabledReason={
                  !isStopped && !isError
                    ? "Project must be stopped to reupload it"
                    : isLoading
                      ? "Another action is in progress"
                      : isStopping
                        ? "Project is currently stopping"
                        : undefined
                }
                variant="outline"
                isLoading={currentAction === "reupload"}
              />
            )}

            {project.source.type === SourceType.GITHUB && (
              <ProjectActionButton
                label="Update"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => handleActionClick("pull")}
                isDisabled={(!isStopped && !isError) || isLoading || isStopping}
                disabledReason={
                  !isStopped && !isError
                    ? "Project must be stopped to update it"
                    : isLoading
                      ? "Another action is in progress"
                      : isStopping
                        ? "Project is currently stopping"
                        : undefined
                }
                variant="outline"
                isLoading={currentAction === "pull" && isPulling}
              />
            )}

            <ProjectActionButton
              label="Recreate"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => handleActionClick("recreate")}
              isDisabled={(!isStopped && !isError) || isLoading || isStopping}
              disabledReason={
                !isStopped && !isError
                  ? "Project must be stopped to recreate it"
                  : isLoading
                    ? "Another action is in progress"
                    : isStopping
                      ? "Project is currently stopping"
                      : undefined
              }
              variant="outline"
              isLoading={currentAction === "recreate" && isRecreating}
            />
          </div>
        </CardContent>

        {dialogConfig && (
          <ProjectActionConfirmDialog
            isOpen={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
            onConfirm={() => executeAction(currentAction)}
            title={dialogConfig.title}
            description={dialogConfig.description}
            confirmLabel={dialogConfig.confirmLabel}
            icon={dialogConfig.icon}
            isDestructive={dialogConfig.isDestructive}
            isLoading={isLoading}
          />
        )}
      </Card>
    </>
  );
};

export default ProjectManagementPanel;
