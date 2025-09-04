export class ProjectTokenResponse {
  id: string;
  name: string;
  token?: string; // Only included when creating a new token
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

