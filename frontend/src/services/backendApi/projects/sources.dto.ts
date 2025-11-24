export enum SourceType {
  GITHUB = "github",
  ZIP_UPLOAD = "zip_upload",
  TEMPLATE = "template",
}

export type CreateSourceDto =
  | {
      type: SourceType.GITHUB;
      authorization_id?: string;
      organization: string;
      repository: string;
      branch: string;
      compose_path: string;
    }
  | {
      type: SourceType.ZIP_UPLOAD;
      compose_path: string;
    }
  | {
      type: SourceType.TEMPLATE;
      templateId: string;
      versionId: string;
      variables: Record<string, string>;
    };
