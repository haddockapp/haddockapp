import { AuthorizationEnum } from '../types/authorization.enum';

interface AuthorizationMetadata {
  name: string;
}

export type AuthorizationDTO = AuthorizationMetadata &
  (
    | {
        type: AuthorizationEnum.OAUTH;
        data: {
          token: string;
        };
      }
    | {
        type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN;
        data: {
          token: string;
        };
      }
    | {
        type: AuthorizationEnum.DEPLOY_KEY;
        data: {
          key: string;
        };
      }
    | {
        type: AuthorizationEnum.NONE;
        data: undefined;
      }
  );
