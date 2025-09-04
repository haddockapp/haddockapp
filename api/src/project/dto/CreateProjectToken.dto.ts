import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateProjectTokenDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

