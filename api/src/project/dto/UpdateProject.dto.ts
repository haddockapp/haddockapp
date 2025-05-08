import {IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID} from "class-validator";
import {AllowedValues} from "../validator/AllowedValues.validator";

export class UpdateProjectDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    authorization_id?: string | null;

    @IsNumber()
    @AllowedValues([1, 4, 8])
    @IsOptional()
    cpus?: number;

    @IsNumber()
    @AllowedValues([1, 2, 3, 4, 5, 6, 7, 8])
    @IsOptional()
    memory?: number;
}
