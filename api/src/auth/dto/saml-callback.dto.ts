import { IsString, IsOptional } from 'class-validator';

export class SamlCallbackDto {
  @IsString()
  @IsOptional()
  SAMLRequest?: string;

  @IsString()
  @IsOptional()
  SAMLResponse?: string;

  @IsString()
  @IsOptional()
  RelayState?: string;
}
