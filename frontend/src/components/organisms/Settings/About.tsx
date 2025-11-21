import { FC, useState } from "react";
import { useGetVersionQuery } from "@/services/backendApi/version";
import { AlertCircle, CheckCircle2, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const About: FC = () => {
  const { data: versionInfo, isLoading, error, refetch } = useGetVersionQuery();
  const [showChangelog, setShowChangelog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error loading version information</p>
              <p className="text-sm text-typography/70 mt-1">
                Failed to load version information. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-zinc-600">
        Below you can find information about your current Haddock installation, including version details and update status.
      </p>

      {/* Version Information */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Version Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-typography/70">Current Version:</span>
            <span className="font-mono font-medium">{versionInfo?.currentVersion}</span>
          </div>
          {versionInfo?.latestVersion && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-typography/70">Latest Version:</span>
              <span className="font-mono font-medium">{versionInfo.latestVersion}</span>
            </div>
          )}
        </div>
      </div>

      {/* Update Status */}
      {versionInfo?.updateAvailable ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  Update Available
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                  A new version ({versionInfo.latestVersion}) of Haddock is available!
                </p>
              </div>

              {/* Changelog */}
              {versionInfo.changelog && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowChangelog(!showChangelog)}
                    className="flex items-center gap-1 text-sm font-medium text-orange-900 dark:text-orange-100 hover:underline"
                  >
                    {showChangelog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showChangelog ? "Hide" : "Show"} Changelog
                  </button>
                  {showChangelog && (
                    <div className="bg-black/10 dark:bg-white/10 rounded p-3 text-xs text-orange-900 dark:text-orange-100 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">{versionInfo.changelog}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Update Instructions */}
              <div className="bg-black/10 dark:bg-white/10 rounded p-3 space-y-2">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  How to Update:
                </p>
                <div className="text-xs font-mono text-orange-900 dark:text-orange-100 space-y-1">
                  <p>1. SSH into your server</p>
                  <p>2. Run: <span className="bg-black/20 dark:bg-white/20 px-1 py-0.5 rounded">sudo haddockctl</span></p>
                  <p>3. Select option 2 "Check for Updates"</p>
                  <p>4. Follow the prompts</p>
                </div>
              </div>

              {/* Release Link */}
              {versionInfo.releaseUrl && (
                <a
                  href={versionInfo.releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-900 dark:text-orange-100 hover:underline flex items-center gap-1"
                >
                  View release on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : versionInfo?.latestVersion ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Up to Date
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                You are running the latest version of Haddock.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* About Section */}
      <div className="border-t border-border pt-4 mt-4 space-y-3">
        <h3 className="text-base font-medium">About Haddock</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Haddock is a modern, developer-friendly Platform-as-a-Service (PaaS) designed to
          streamline application deployment through containerization.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-typography/70 w-24 flex-shrink-0">Project:</span>
            <span className="text-typography">Haddock - Your All-in-One Platform Engineer</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-typography/70 w-24 flex-shrink-0">License:</span>
            <span className="text-typography">Custom Educational License</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-typography/70 w-24 flex-shrink-0">Contact:</span>
            <span className="text-typography">contact@haddock.ovh</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-typography/70 w-24 flex-shrink-0">Repository:</span>
            <a
              href="https://github.com/haddockapp/haddockapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              github.com/haddockapp/haddockapp
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

