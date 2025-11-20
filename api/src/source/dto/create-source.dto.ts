import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export enum SourceType {
  GITHUB = 'github',
  ZIP_UPLOAD = 'zip_upload',
  TEMPLATE = 'template',
}

export interface DefaultSource {
  type: SourceType;
}

export class CreateGithubSourceDto implements DefaultSource {
  type = SourceType.GITHUB;

  @IsUUID()
  @IsNotEmpty()
  authorization_id: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsString()
  @IsNotEmpty()
  repository: string;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsString()
  @IsNotEmpty()
  compose_path: string;
}

export class CreateZipUploadSourceDto implements DefaultSource {
  type = SourceType.ZIP_UPLOAD;

  @IsString()
  @IsNotEmpty()
  compose_path: string;
}

export class CreateTemplateSourceDto implements DefaultSource {
  type = SourceType.TEMPLATE;

  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  versionId: string;

  @IsNotEmpty()
  variables: Record<string, string>;
}

export type CreateSourceDto =
  | CreateGithubSourceDto
  | CreateZipUploadSourceDto
  | CreateTemplateSourceDto;
