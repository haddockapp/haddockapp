import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SeverityLevel,
  SecurityFinding,
} from "@/services/backendApi/security/types";
import { cn } from "@/lib/utils";

interface SecuritySummaryBarProps {
  findings: SecurityFinding[];
}

const SecuritySummaryBar: FC<SecuritySummaryBarProps> = ({ findings }) => {
  const counts = {
    [SeverityLevel.CRITICAL]: 0,
    [SeverityLevel.HIGH]: 0,
    [SeverityLevel.MEDIUM]: 0,
    [SeverityLevel.LOW]: 0,
  };

  findings.forEach((finding) => {
    if (counts[finding.severity] !== undefined) {
      counts[finding.severity]++;
    }
  });

  const segments = [
    // Using a "Total" or similar placeholder if we don't have 5 categories?
    // User image has 5. Let's try to match keeping logic sound.
    // If we only have 4, we render 4.
    // If the user wants 5, maybe one is "Unknown"? But we don't have it.
    // I'll render the 4 known severities in order: Critical -> High -> Medium -> Low
    {
      severity: SeverityLevel.CRITICAL,
      count: counts[SeverityLevel.CRITICAL],
      label: "Critical",
      color:
        counts[SeverityLevel.CRITICAL] > 0
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-muted text-muted-foreground dark:bg-muted/50",
    },
    {
      severity: SeverityLevel.HIGH,
      count: counts[SeverityLevel.HIGH],
      label: "High",
      color:
        counts[SeverityLevel.HIGH] > 0
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          : "bg-muted text-muted-foreground dark:bg-muted/50",
    },
    {
      severity: SeverityLevel.MEDIUM,
      count: counts[SeverityLevel.MEDIUM],
      label: "Medium",
      color:
        counts[SeverityLevel.MEDIUM] > 0
          ? "bg-amber-100 text-amber-700 dark:bg-yellow-900/30 dark:text-yellow-300"
          : "bg-muted text-muted-foreground dark:bg-muted/50",
    },
    {
      severity: SeverityLevel.LOW,
      count: counts[SeverityLevel.LOW],
      label: "Low",
      color:
        counts[SeverityLevel.LOW] > 0
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-muted text-muted-foreground dark:bg-muted/50",
    },
  ];

  // If there are no findings, should we show all 0s? Yes.

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-8 w-full max-w-[300px] overflow-hidden rounded-md text-sm font-bold shadow-sm">
        {segments.map((segment) => (
          <Tooltip key={segment.severity}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex flex-1 cursor-default items-center justify-center transition-colors hover:opacity-90",
                  segment.color,
                )}
              >
                {segment.count}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {segment.label}: {segment.count} issue
                {segment.count !== 1 && "s"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SecuritySummaryBar;
