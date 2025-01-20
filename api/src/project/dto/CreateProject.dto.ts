import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AllowedValues } from '../validator/AllowedValues.validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  repository_organisation: string;

  @IsString()
  @IsNotEmpty()
  repository_name: string;

  @IsString()
  @IsNotEmpty()
  repository_branch: string;

  @IsString()
  @IsNotEmpty()
  compose_name: string;

  @IsNumber()
  @AllowedValues([512, 1024, 2048, 3072, 4096, 5120, 6144, 7168, 8192])
  vm_memory: number;

  @IsNumber()
  @Min(256)
  vm_disk: number;

  @IsNumber()
  @AllowedValues([1, 2, 3, 4, 5, 6, 7, 8])
  vm_cpus: number;

  @IsUUID()
  @IsOptional()
  authorization_id: string | null;
}
