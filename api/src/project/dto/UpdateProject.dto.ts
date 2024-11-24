import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
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

    @IsString()
    @IsOptional()
    repository_branch?: string;

    @IsNumber()
    @AllowedValues([1, 4, 8])
    @IsOptional()
    cpus?: number;

    @IsNumber()
    @AllowedValues([1, 2, 3, 4, 5, 6, 7, 8])
    @IsOptional()
    memory?: number;
}
