export interface VersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  changelog: string | null;
  releaseUrl: string | null;
}

