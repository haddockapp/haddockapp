import { IsUUID } from "class-validator";

export class AutologinRequestDto {
  @IsUUID()
  token: string;
}
