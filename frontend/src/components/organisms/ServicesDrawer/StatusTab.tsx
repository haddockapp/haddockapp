import type { FC } from "react";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceState } from "@/types/services/services";
import { cn } from "@/lib/utils";

interface StatusTabProps {
  status: string;
  image: string;
  onStart: () => void;
  onRestart: () => void;
  onStop: () => void;
}

const StatusTab: FC<StatusTabProps> = ({
  status,
  image,
  onStart,
  onRestart,
  onStop,
}) => {
  // Determine if actions should be disabled based on current status
  const isRunning = status === ServiceState.Running;
  const isStopped = status === ServiceState.Stopped;
  const isStarting = status === ServiceState.Starting;

  // Get status indicator styles
  const getStatusStyles = () => {
    switch (status) {
      case ServiceState.Running:
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-500",
          bgLight: "bg-emerald-50",
        };
      case ServiceState.Starting:
        return {
          color: "text-amber-600",
          bg: "bg-amber-500",
          bgLight: "bg-amber-50",
        };
      default:
        return {
          color: "text-red-600",
          bg: "bg-red-500",
          bgLight: "bg-red-50",
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div className="space-y-6">
      {/* Status section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Current status</h3>
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", statusStyles.bg)} />
            <span className={cn("text-sm font-medium", statusStyles.color)}>
              {status}
            </span>
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
            <EllipsisVertical className="h-5 w-5" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={onStart}
              disabled={isRunning || isStarting}
              className={cn(
                (isRunning || isStarting) && "opacity-50 cursor-not-allowed"
              )}
            >
              Start
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onRestart}
              disabled={!isRunning}
              className={cn(!isRunning && "opacity-50 cursor-not-allowed")}
            >
              Restart
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onStop}
              disabled={isStopped}
              className={cn(isStopped && "opacity-50 cursor-not-allowed")}
            >
              Stop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Image</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-800" />
          <span>{image}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusTab;
