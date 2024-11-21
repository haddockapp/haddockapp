import { AuthorizationEnum } from "./authorization.enum";

export type AuthorizationObject = {
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