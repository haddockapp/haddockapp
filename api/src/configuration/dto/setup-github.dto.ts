import { IsNotEmpty, IsString } from 'class-validator';

export class SetupGitbubDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;
}
