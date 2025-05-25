import { VmState } from "@/types/vm/vm";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";

interface ProjectStatusBadgeProps {
  status: VmState;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const ProjectStatusBadge: FC<ProjectStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = "md",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case VmState.Running:
        return {
          label: "Running",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case VmState.Starting:
        return {
          label: "Starting",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        };
      case VmState.Stopping:
        return {
          label: "Stopping",
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        };
      case VmState.Stopped:
        return {
          label: "Stopped",
          bgColor: "bg-slate-100",
          textColor: "text-slate-700",
          borderColor: "border-slate-200",
          icon: <Clock className="h-4 w-4" />,
        };
      default:
        return {
          label: "Error",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          icon: <AlertCircle className="h-4 w-4" />,
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
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        bgColor,
        textColor,
        borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon}
      <span>{label}</span>
    </div>
  );
};

export default ProjectStatusBadge;
