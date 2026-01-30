import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class SetupSamlDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  entryPoint: string;

  @IsString()
  @IsNotEmpty()
  issuer: string;

  @IsString()
  @IsNotEmpty()
  cert: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  callbackUrl?: string;
}
