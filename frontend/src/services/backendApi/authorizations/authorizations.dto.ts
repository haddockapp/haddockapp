export enum AuthorizationEnum {
  OAUTH = "oauth",
  PERSONAL_ACCESS_TOKEN = "personal_access_token",
  DEPLOY_KEY = "deploy_key",
}

export type Authorization = {
  id: string;
  name: string;
  type: AuthorizationEnum;
};

export type AuthorizationCreateDto =
  | {
      name: string;
      type: AuthorizationEnum.DEPLOY_KEY;
      data: {
        key: string;
      };
    }
  | {
      name: string;
      type: AuthorizationEnum.OAUTH;
      data: {
        code: string;
      };
    }
  | {
      name: string;
      type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN;
      data: {
        token: string;
      };
    };
