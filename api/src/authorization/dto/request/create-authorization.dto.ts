import { IsEnum, IsNotEmpty, IsString, ValidateNested} from "class-validator";
import { AuthorizationEnum } from "../../types/authorization.enum";
import { Type } from "class-transformer";

class PersonalAccessTokenData {
    @IsString()
    token: string;
}

class OAuthData {
    @IsString()
    token: string;
}

class DeployKeyData {
    @IsString()
    key: string;
}

export class CreateAuthorizationDTO {
    @IsEnum(AuthorizationEnum)
    type: string;

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
