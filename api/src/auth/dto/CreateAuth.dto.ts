import { AuthEnum } from "../types/auth.enum";

export class CreateAuthDto {
    type: AuthEnum;

    value: string;
}
