export type EditProjectForm = {
  name: string;
  description?: string;
};

export enum TabsValue {
  Status = "status",
  Config = "config",
  Networks = "networks",
}
