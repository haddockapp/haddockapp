import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileCode2,
  Info,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { FC, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        "uppercase text-xs font-bold px-2 py-0.5",
        colors[severity],
      )}
    >
      {severity}
    </Badge>
  );
};

const CategoryIcon: FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case "secrets":
      return <Lock className="w-4 h-4 text-primary" />;
    case "docker-vulnerabilities":
      return <Blocks className="w-4 h-4 text-primary" />;
    case "misconfigurations":
      return <FileCode2 className="w-4 h-4 text-primary" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-primary" />;
  }
};

const SecurityFindingItem: FC<{ finding: SecurityFinding }> = ({ finding }) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CategoryIcon category={finding.category} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{finding.title}</h4>
              <SeverityBadge severity={finding.severity} />
            </div>
            <p className="text-sm text-muted-foreground">
              {finding.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm bg-muted/30 p-3 rounded-md">
        {finding.location && (
          <div className="space-y-1">
            <span className="font-medium text-muted-foreground flex items-center gap-1">
              <FileCode2 className="w-3 h-3" /> Location
            </span>
            <div className="font-mono text-xs break-all">
              {finding.location.file}
              {finding.location.key && ` : ${finding.location.key}`}
              {finding.location.startLine && ` : ${finding.location.startLine}`}
            </div>
          </div>
        )}
        {finding.recommendation && (
          <div className="space-y-1 col-span-2">
            <span className="font-medium text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Recommendation
            </span>
            <p className="text-xs">{finding.recommendation}</p>
          </div>
        )}
      </div>

      {finding.metadata && Object.keys(finding.metadata).length > 0 && (
        <Accordion type="single" collapsible className="w-full border-none">
          <AccordionItem value="metadata" className="border-none">
            <AccordionTrigger className="py-2 text-xs hover:no-underline">
              View Metadata
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-2 rounded-md font-mono text-xs overflow-x-auto">
                {JSON.stringify(finding.metadata, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

const SecurityTab: FC<SecurityTabProps> = ({ projectId }) => {
  const { data, isLoading, refetch } = useGetFindingsQuery(projectId);
  const [analyze, { isLoading: isAnalyzing }] = useAnalyzeProjectMutation();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    try {
      await analyze(projectId).unwrap();
      await refetch();
      toast({
        title: "Success",
        description: "Security analysis completed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run security analysis",
      });
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-red-500/5">
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
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-orange-500/5">
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
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-card to-blue-500/5">
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
              Comprehensive list of security vulnerabilities and
              misconfigurations.
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
        <CardContent className="px-0">
          {findings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/10">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No Issues Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">
                Great job! No security issues were detected in this project. Run
                an analysis if you haven't already.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {findings.map((finding, index) => (
                  <SecurityFindingItem key={index} finding={finding} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
