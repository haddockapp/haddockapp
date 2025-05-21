import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectActionButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  disabledReason?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "dark";
  isLoading?: boolean;
  className?: string;
}

const ProjectActionButton: FC<ProjectActionButtonProps> = ({
  label,
  icon,
  onClick,
  isDisabled = false,
  disabledReason,
  variant = "outline",
  isLoading = false,
  className,
}) => {
  const button = (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={cn("gap-2", className)}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </Button>
  );

  if (isDisabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default ProjectActionButton;
