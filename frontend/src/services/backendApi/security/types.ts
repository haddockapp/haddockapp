export const SecurityCategories = {
  SECRETS: "secrets",
  DOCKER_VULNERABILITIES: "docker-vulnerabilities",
  MISCONFIGURATIONS: "misconfigurations",
} as const;

export type SecurityCategory =
  (typeof SecurityCategories)[keyof typeof SecurityCategories];

export const SeverityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type Severity = (typeof SeverityLevel)[keyof typeof SeverityLevel];

export interface SecurityLocation {
  file: string;
  key?: string;
  service?: string;
  image?: string;
  startLine?: number;
  endLine?: number;
  [key: string]: unknown;
}

export interface SecurityMetadata {
  key?: string;
  service?: string;
  vulnerabilityId?: string;
  packageName?: string;
  installedVersion?: string;
  fixedVersion?: string;
  [key: string]: unknown;
}

export interface SecurityFinding {
  severity: Severity;
  category: SecurityCategory;
  title: string;
  description: string;
  recommendation?: string;
  source: string;
  location?: SecurityLocation;
  metadata?: SecurityMetadata;
}

export interface SecurityFindingDto {
  severity: Severity;
  category: SecurityCategory;
  title: string;
  description: string;
  recommendation?: string;
  source: string;
  location?: string;
  metadata?: string;
}
