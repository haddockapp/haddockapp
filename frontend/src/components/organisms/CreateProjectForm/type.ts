export enum FormSteps {
  STEP_1,
  FINAL_STEP,
}

export type CreateProjectForm = {
  repository: string;
  branch: string;
  memory: number;
  disk: number;
  vcpus: number;
  composeName: string;
};
