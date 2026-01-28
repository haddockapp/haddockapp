import { IsString } from 'class-validator';

export class ConnectGithubDto {
  @IsString()
  code: string;
}
