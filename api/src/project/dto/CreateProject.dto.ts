import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { AllowedValues } from '../validator/AllowedValues.validator';

export class CreateProjectDto {
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
  @IsNotEmpty()
  source_id: string;

  @IsUUID()
  @IsOptional()
  authorization_id: string | null;

  @IsUUID()
  @IsOptional()
  workspace_id: string | null;
}
