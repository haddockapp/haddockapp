import { Button } from "@/components/ui/button";
import { useState, type FC } from "react";
import { Play, RefreshCw, Square, MoreHorizontal } from "lucide-react";
import { ServiceState } from "@/types/services/services";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusTabProps {
  status: string;
  image: string;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
}

const StatusTab: FC<StatusTabProps> = ({
  status,
  image,
  onStart,
  onRestart,
  onStop,
}) => {
  const isRunning = status === ServiceState.Running;
  const isStopped = status === ServiceState.Stopped;
  const isStarting = status === ServiceState.Starting;

  const [skeletonStatus, setSkeletonStatus] = useState<boolean>(false);

  const handleChangeStatus = (fn: () => void) => {
    setSkeletonStatus(true);
    fn();
    setTimeout(() => {
      setSkeletonStatus(false);
    }, 1000);
  };

  const getStatusInfo = () => {
    switch (status) {
      case ServiceState.Running:
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-500",
          bgLight: "bg-emerald-50",
          icon: <Play className="h-5 w-5 text-emerald-600" />,
        };
      case ServiceState.Starting:
        return {
          color: "text-amber-600",
          bg: "bg-amber-500",
          bgLight: "bg-amber-50",
          icon: <RefreshCw className="h-5 w-5 text-amber-600 animate-spin" />,
        };
      default:
        return {
          color: "text-red-600",
          bg: "bg-red-500",
          bgLight: "bg-red-50",
          icon: <Square className="h-5 w-5 text-red-600" />,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      <Card
        className={cn(
          "border",
          isRunning
            ? "border-emerald-200"
            : isStarting
            ? "border-amber-200"
            : "border-red-200"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", statusInfo.bgLight)}>
                {statusInfo.icon}
              </div>
              <div>
                <h3 className="font-medium text-typography/90">
                  Current Status
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("h-2 w-2 rounded-full", statusInfo.bg)} />
                  {skeletonStatus ? (
                    <Skeleton className="h-[24px] w-[96px]" />
                  ) : (
                    <span className={statusInfo.color}>
                      {status.slice(0, 1).toUpperCase().concat(status.slice(1))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => handleChangeStatus(onStart)}
                  disabled={isRunning || isStarting}
                  className={cn(
                    "cursor-pointer",
                    (isRunning || isStarting) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChangeStatus(onRestart)}
                  disabled={!isRunning}
                  className={cn(
                    "cursor-pointer",
                    !isRunning && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChangeStatus(onStop)}
                  disabled={isStopped}
                  className={cn(
                    "cursor-pointer",
                    isStopped && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium text-typography/90 mb-3">
            Image Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-typography/70 min-w-24">
                Image:
              </span>
              <span className="text-typography/60">{image}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusTab;
