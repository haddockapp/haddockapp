import { IsEnum, IsNotEmpty, IsString, ValidateNested} from "class-validator";
import { AuthorizationEnum } from "../../types/authorization.enum";
import { Type } from "class-transformer";

export class PersonalAccessTokenData {
    @IsString()
    token: string;
}

export class OAuthData {
    @IsString()
    code: string;
}

export class DeployKeyData {
    @IsString()
    key: string;
}

export class CreateAuthorizationDTO {
    @IsEnum(AuthorizationEnum)
    type: AuthorizationEnum;

    @IsString()
    @IsNotEmpty()
    name: string;

    @ValidateNested()
    @IsNotEmpty()
    @Type((obj) => {
        switch (obj?.object?.type) {
            case AuthorizationEnum.PERSONAL_ACCESS_TOKEN:
                return PersonalAccessTokenData;
            case AuthorizationEnum.OAUTH:
                return OAuthData;
            case AuthorizationEnum.DEPLOY_KEY:
                return DeployKeyData;
            default:
                return Object;
        }
    })
    data: PersonalAccessTokenData | OAuthData | DeployKeyData;
}
