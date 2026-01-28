import { SecurityFact } from '../../../types/facts';
import { TrivySeverity } from '../../rules/trivy/docker-vuln/trivy-output.type';

export interface TrivyConfigFact extends SecurityFact {
  type: 'trivy-config';
  target: string;
  misconfiguration: Misconfiguration;
}

export interface TrivyConfigOutput {
  SchemaVersion: number;
  ReportID: string;
  CreatedAt: Date;
  ArtifactID: string;
  ArtifactName: string;
  ArtifactType: string;
  Metadata: Metadata;
  Results: Result[];
}

export interface Metadata {
  RepoURL: string;
  Branch: string;
  Commit: string;
  CommitMsg: string;
  Author: string;
  Committer: string;
}

export interface Result {
  Target: string;
  Class: string;
  Type: string;
  MisconfSummary: MisconfSummary;
  Misconfigurations: Misconfiguration[];
}

export interface MisconfSummary {
  Successes: number;
  Failures: number;
}

export interface Misconfiguration {
  Type: string;
  ID: string;
  AVDID: string;
  Title: string;
  Description: string;
  Message: string;
  Namespace: string;
  Query: string;
  Resolution: string;
  Severity: TrivySeverity;
  PrimaryURL: string;
  References: string[];
  Status: string;
  CauseMetadata: CauseMetadata;
}

export interface CauseMetadata {
  Provider: string;
  Service: string;
}
