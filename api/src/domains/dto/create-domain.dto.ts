import { Optional } from "@nestjs/common";
import { IsBoolean, IsString, Matches } from "class-validator";

const DOMAIN_NAME_REGEX = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,8}$/;

export class CreateDomainDto {
    @IsString()
    @Matches(DOMAIN_NAME_REGEX, { message: "Invalid domain name" })
    domain: string;

    @IsBoolean()
    main: boolean;

    @IsBoolean()
    @Optional()
    https?: boolean;
}
