import { SecurityCategory } from './categories';

export const SeverityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type Severity = (typeof SeverityLevel)[keyof typeof SeverityLevel];

export interface SecurityFinding {
  severity: Severity;
  category: SecurityCategory;
  title: string;
  description: string;
  recommendation?: string;
  source: string;
  location?: string;
  metadata?: string;
}
