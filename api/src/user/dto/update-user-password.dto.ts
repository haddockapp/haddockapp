import { IsStrongPassword } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsStrongPassword()
  password: string;
}
