import { IsBoolean } from 'class-validator';

export class ToggleSamlDto {
  @IsBoolean()
  enabled: boolean;
}
