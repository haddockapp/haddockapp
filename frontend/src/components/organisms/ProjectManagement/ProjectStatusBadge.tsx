import { VmState } from "@/types/vm/vm";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

interface ProjectStatusBadgeProps {
  status: VmState;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  tooltip?: string;
  isAlert?: boolean;
}

const ProjectStatusBadge: FC<ProjectStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = "md",
  onClick,
  tooltip,
  isAlert,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case VmState.Running:
        return {
          label: "Running",
          bgColor: "dark:bg-emerald-700 bg-emerald-100",
          textColor: "dark:text-white text-emerald-700",
          borderColor: "dark:border-emerald-900 border-emerald-200",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case VmState.Starting:
        return {
          label: "Starting",
          bgColor: "dark:bg-amber-600 bg-amber-100",
          textColor: "dark:text-white text-amber-700",
          borderColor: "dark:border-amber-900 border-amber-200",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        };
      case VmState.Stopping:
        return {
          label: "Stopping",
          bgColor: "dark:bg-amber-600 bg-amber-100",
          textColor: "dark:text-white text-amber-700",
          borderColor: "dark:border-amber-900 border-amber-200",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        };
      case VmState.Stopped:
        return {
          label: "Stopped",
          bgColor: "dark:bg-slate-800 bg-slate-100",
          textColor: "dark:text-white text-slate-700",
          borderColor: "dark:border-slate-900 border-slate-200",
          icon: <Clock className="h-4 w-4" />,
        };
      default:
        return {
          label: "Error",
          bgColor: "dark:bg-red-800 bg-red-100",
          textColor: "dark:text-white text-red-700",
          borderColor: "dark:border-red-900 border-red-200",
          icon: <QuestionMarkCircledIcon className="h-4 w-4" />,
        };
    }
  };

  const { label, bgColor, textColor, borderColor, icon } = getStatusConfig();

  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-2.5",
    lg: "text-base py-1.5 px-3",
  };

  return (
    <Tooltip delayDuration={0}>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
      <TooltipTrigger>
        <div
          className={cn(
            `inline-flex items-center gap-1.5 rounded-sm border font-medium cursor-pointer hover:brightness-95
            ${isAlert ? "motion-safe:animate-scale-pulse transform-gpu" : ""}`,
            bgColor,
            textColor,
            borderColor,
            sizeClasses[size],
            className
          )}
          onClick={onClick}
        >
          {showIcon && icon}
          <span>{label}</span>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default ProjectStatusBadge;
