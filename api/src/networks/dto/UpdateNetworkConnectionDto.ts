import { IsNumber, IsString } from 'class-validator';

export class UpdateNetworkConnectionDto {
  @IsString()
  domain: string;

  @IsNumber()
  port: number;
}
