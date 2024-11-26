import { AuthorizationEnum } from "../types/authorization.enum";

export type AuthorizationDTO = {
    type: AuthorizationEnum.OAUTH;
    data: {
        token: string
    }
} | {
    type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN;
    data: {
        token: string
    }
} | {
    type: AuthorizationEnum.DEPLOY_KEY;
    data: {
        key: string
    }
};