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
