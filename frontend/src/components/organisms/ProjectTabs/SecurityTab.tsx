import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAnalyzeProjectMutation,
  useGetFindingsQuery,
} from "@/services/backendApi/security/security";
import {
  SecurityFinding,
  Severity,
  SeverityLevel,
} from "@/services/backendApi/security/types";
import {
  AlertTriangle,
  Blocks,
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Info,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecurityTabProps {
  projectId: string;
}

const SeverityBadge: FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [SeverityLevel.CRITICAL]: "bg-red-500/15 text-red-600 hover:bg-red-500/25",
    [SeverityLevel.HIGH]:
      "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25",
    [SeverityLevel.MEDIUM]:
      "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25",
    [SeverityLevel.LOW]: "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "uppercase text-[10px] font-bold px-1.5 py-0.5",
        colors[severity],
      )}
    >
      {severity.charAt(0).toUpperCase()}
    </Badge>
  );
};

const CategoryIcon: FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case "secrets":
      return <Lock className="w-4 h-4 text-purple-400" />;
    case "docker-vulnerabilities":
      return <Blocks className="w-4 h-4 text-blue-400" />;
    case "misconfigurations":
      return <FileCode2 className="w-4 h-4 text-orange-400" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-primary" />;
  }
};

// Component to parse and render URLs as clickable links
const Linkify: FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Reset regex lastIndex since we're reusing it
          urlRegex.lastIndex = 0;
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const SecurityFindingRow: FC<{ finding: SecurityFinding }> = ({ finding }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-colors",
          isExpanded && "bg-muted/50 border-b-0",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="w-[50px]">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-medium text-sm w-[30%]">
          {finding.title}
        </TableCell>
        <TableCell className="w-[100px]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono">
              {finding.severity === SeverityLevel.CRITICAL
                ? "10.0"
                : finding.severity === SeverityLevel.HIGH
                  ? "7.5"
                  : finding.severity === SeverityLevel.MEDIUM
                    ? "5.3"
                    : "2.0"}
            </span>
            <SeverityBadge severity={finding.severity} />
          </div>
        </TableCell>
        <TableCell className="w-[50px]">
          <Check className="w-4 h-4 text-white" />
        </TableCell>
        <TableCell className="w-[50px]">
          <CategoryIcon category={finding.category} />
        </TableCell>
        <TableCell className="text-muted-foreground text-xs font-mono">
          {finding.location?.image || finding.location?.file || "N/A"}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30 border-t-0">
          <TableCell colSpan={6} className="p-0">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm text-foreground/90 pb-4 border-b border-border/50">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-blue-500" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {finding.location?.image || finding.location?.file}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Description:</span>
                  <div className="text-foreground/90 whitespace-pre-wrap">
                    <Linkify text={finding.description} />
                  </div>
                </div>

                {finding.recommendation && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">
                      Recommendation:
                    </span>
                    <div className="text-foreground/90">
                      <Linkify text={finding.recommendation} />
                    </div>
                  </div>
                )}

                {finding.metadata &&
                  Object.entries(finding.metadata).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <div
                        className="text-foreground/90 font-mono text-xs max-w-full"
                        title={String(value)}
                      >
                        <Linkify text={String(value)} />
                      </div>
                    </div>
                  ))}

                {finding.location && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Location:</span>
                    <div className="text-foreground/90 font-mono text-xs">
                      {finding.location.file}
                      {finding.location.key && ` : ${finding.location.key}`}
                      {finding.location.startLine &&
                        ` : L${finding.location.startLine}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const SecurityTab: FC<SecurityTabProps> = ({ projectId }) => {
  const { data, isLoading, refetch } = useGetFindingsQuery(projectId);
  const [analyze, { isLoading: isAnalyzing }] = useAnalyzeProjectMutation();
  const [selectedFilter, setSelectedFilter] = useState<
    "critical" | "high" | "other" | null
  >(null);

  const handleAnalyze = async () => {
    try {
      await analyze(projectId).unwrap();
      await refetch();
      toast.success("Security analysis completed successfully");
    } catch (error) {
      toast.error("Failed to run security analysis");
    }
  };

  const findings = data?.findings ?? [];
  const criticalCount = findings.filter(
    (f) => f.severity === SeverityLevel.CRITICAL,
  ).length;
  const highCount = findings.filter(
    (f) => f.severity === SeverityLevel.HIGH,
  ).length;
  const otherCount = findings.length - criticalCount - highCount;

  const filteredFindings = findings.filter((f) => {
    if (!selectedFilter) return true;
    if (selectedFilter === "critical")
      return f.severity === SeverityLevel.CRITICAL;
    if (selectedFilter === "high") return f.severity === SeverityLevel.HIGH;
    if (selectedFilter === "other")
      return (
        f.severity !== SeverityLevel.CRITICAL &&
        f.severity !== SeverityLevel.HIGH
      );
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={cn(
            "relative overflow-hidden border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-red-500/5 cursor-pointer",
            selectedFilter === "critical" &&
              "bg-red-500/10 shadow-md scale-[1.02]",
            selectedFilter !== null &&
              selectedFilter !== "critical" &&
              "opacity-50 grayscale scale-[0.98]",
          )}
          onClick={() =>
            setSelectedFilter(selectedFilter === "critical" ? null : "critical")
          }
        >
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 opacity-[0.03]">
            <ShieldAlert className="h-full w-full text-red-600" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Issues
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-red-600">
                {criticalCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-orange-500/5 cursor-pointer",
            selectedFilter === "high" &&
              "bg-orange-500/10 shadow-md scale-[1.02]",
            selectedFilter !== null &&
              selectedFilter !== "high" &&
              "opacity-50 grayscale scale-[0.98]",
          )}
          onClick={() =>
            setSelectedFilter(selectedFilter === "high" ? null : "high")
          }
        >
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 opacity-[0.03]">
            <AlertTriangle className="h-full w-full text-orange-600" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Severity Issues
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-orange-600">
                {highCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Should be fixed soon
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-blue-500/5 cursor-pointer",
            selectedFilter === "other" &&
              "bg-blue-500/10 shadow-md scale-[1.02]",
            selectedFilter !== null &&
              selectedFilter !== "other" &&
              "opacity-50 grayscale scale-[0.98]",
          )}
          onClick={() =>
            setSelectedFilter(selectedFilter === "other" ? null : "other")
          }
        >
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 opacity-[0.03]">
            <Info className="h-full w-full text-blue-600" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Medium & Low Issues
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-600">
                {otherCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Monitor and fix when possible
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Security Findings</CardTitle>
            <CardDescription>
              Comprehensive list of vulnerabilities and misconfigurations.
            </CardDescription>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="sm"
            className="gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </CardHeader>
        <CardContent className="px-0 border rounded-lg overflow-hidden bg-card">
          {filteredFindings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No Issues Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">
                {findings.length === 0
                  ? "Great job! No security issues were detected in this project. Run an analysis if you haven't already."
                  : "No issues match the selected filter."}
              </p>
            </div>
          ) : (
            <Table>
              <TableBody>
                {filteredFindings.map((finding, index) => (
                  <SecurityFindingRow key={index} finding={finding} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
