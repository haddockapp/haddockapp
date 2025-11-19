import {
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Validate,
  validateSync,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AllowedValues } from '../validator/AllowedValues.validator';
import {
  CreateGithubSourceDto,
  CreateSourceDto,
  CreateZipUploadSourceDto,
  SourceType,
} from 'src/source/dto/create-source.dto';
import { plainToInstance, Transform } from 'class-transformer';

// Custom transformer for the union type
function TransformSource() {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'object') return value;

    if (value.type === SourceType.GITHUB) {
      return plainToInstance(CreateGithubSourceDto, value);
    } else if (value.type === SourceType.ZIP_UPLOAD) {
      return plainToInstance(CreateZipUploadSourceDto, value);
    }

    return value;
  });
}

@ValidatorConstraint({ name: 'validSource', async: false })
class ValidSourceConstraint implements ValidatorConstraintInterface {
  validate(source: any) {
    if (!source || typeof source !== 'object') return false;

    if (source.type === SourceType.GITHUB) {
      const errors = validateSync(
        plainToInstance(CreateGithubSourceDto, source),
      );
      return errors.length === 0;
    } else if (source.type === SourceType.ZIP_UPLOAD) {
      const errors = validateSync(
        plainToInstance(CreateZipUploadSourceDto, source),
      );
      return errors.length === 0;
    }

    return false;
  }

  defaultMessage() {
    return 'Source must be a valid GitHub or ZIP upload source';
  }
}

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

  @TransformSource()
  @Validate(ValidSourceConstraint)
  source: CreateSourceDto;

  @IsUUID()
  @IsOptional()
  authorization_id: string | null;

  @IsUUID()
  @IsOptional()
  workspace_id: string | null;
}
