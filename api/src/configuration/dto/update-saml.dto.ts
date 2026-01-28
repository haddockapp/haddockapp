import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSamlDto {
  @IsString()
  @IsUrl()
  @IsOptional()
  entryPoint?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  cert?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  callbackUrl?: string;
}
