import { IsNotEmpty, IsString } from "class-validator";

export class SetupGithubDto {
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @IsString()
    @IsNotEmpty()
    client_secret: string;
}
