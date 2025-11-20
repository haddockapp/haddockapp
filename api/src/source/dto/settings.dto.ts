export interface GithubSourceSettingsDto {
  organization: string;
  repository: string;
  branch: string;
  composePath: string;
}

export interface ZipUploadSourceSettingsDto {
  composePath: string;
  status: 'none' | 'uploaded' | 'deployed';
}

export interface TemplateSourceSettingsDto {
  version: string; // JSON stringified Version object
}

export type SourceSettingsDto =
  | GithubSourceSettingsDto
  | ZipUploadSourceSettingsDto
  | TemplateSourceSettingsDto;
