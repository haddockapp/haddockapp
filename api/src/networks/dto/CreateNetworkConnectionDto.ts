import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateNetworkConnectionDto {
  @IsString()
  domain: string;

  @IsNumber()
  port: number;

  @IsUUID()
  projectId: string;
}
