import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { EnvironmentVar } from 'src/project/dto/environmentVar';
import { AllowedValues } from 'src/project/validator/AllowedValues.validator';

export interface RedirectDto {
  port: number;
  domain: string;
  prefix?: string;
}

function TransformJson() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException(`Invalid JSON format for value: ${value}`);
    }
  });
}

export class UnifiedDeployDto {
  @IsString()
  @Length(6, 6)
  deploy_code: string;

  @IsNumber()
  @AllowedValues([512, 1024, 2048, 3072, 4096, 5120, 6144, 7168, 8192])
  ram: number;

  @IsNumber()
  @AllowedValues([1, 2, 3, 4, 5, 6, 7, 8])
  cpu: number;

  @IsNumber()
  @Min(256)
  disk: number;

  @IsString()
  @IsNotEmpty()
  compose_path: string;

  @TransformJson()
  @IsOptional()
  @IsArray()
  redirects?: RedirectDto[];

  @TransformJson()
  @IsOptional()
  @IsArray()
  env?: EnvironmentVar[];
}
