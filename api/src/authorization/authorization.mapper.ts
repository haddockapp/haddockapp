import {
    Injectable
} from '@nestjs/common';
import { Authorization } from '@prisma/client';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationResponse } from './dto/authorization.response';
import { CreateAuthorizationDTO } from './dto/request/create-authorization.dto';

@Injectable()
export class AuthorizationMapper {
    public toAuthorizationObject(authorization: Authorization): AuthorizationDTO {
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
