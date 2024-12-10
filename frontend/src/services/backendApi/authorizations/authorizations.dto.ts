export enum AuthorizationEnum {
    OAUTH = 'oauth',
    PERSONAL_ACCESS_TOKEN = 'personal_access_token',
    DEPLOY_KEY = 'deploy_key'
}

export type Authorization = {
    id: string;
    type: AuthorizationEnum;
}

export type AuthorizationCreateDto = {
    type: AuthorizationEnum.DEPLOY_KEY;
    data: {
        key: string;
    }
} | {
    type: AuthorizationEnum.OAUTH;
    data: {
        code: string;
    }
} | {
    type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN;
    data: {
        token: string;
    }
}