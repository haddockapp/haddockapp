export type CreateWorkspaceDto = {
  name: string;
  description?: string;
};

export type WorkspaceDto = {
  id: string;
  name: string;
  description?: string;
  _count: { projects: number };
};
