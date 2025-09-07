import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateNetworkConnectionDto {
  @IsUUID()
  domainId: string;

  @IsString()
  @IsNotEmpty()
  prefix: string;

  @IsNumber()
  port: number;

  @IsUUID()
  projectId: string;
}
