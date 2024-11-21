import {
    Injectable
} from '@nestjs/common';
import { Authorization } from '@prisma/client';
import { AuthorizationObject } from './types/authorization-object';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationResponse } from './types/authorization.response';

@Injectable()
export class AuthorizationMapper {
    public toAuthorizationObject(authorization: Authorization): AuthorizationObject {
        return {
            type: authorization.type as AuthorizationEnum,
            data: JSON.parse(authorization.value as string),
        };
    }

    public toResponse(authorization: Authorization): AuthorizationResponse {
        return {
            id: authorization.id,
            type: authorization.type,
        };
    }

}
