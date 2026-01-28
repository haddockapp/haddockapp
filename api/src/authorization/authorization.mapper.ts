import { Injectable } from '@nestjs/common';
import { Authorization } from '@prisma/client';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationResponse } from './dto/authorization.response';
import { AuthorizationEnum } from './types/authorization.enum';

@Injectable()
export class AuthorizationMapper {
  public toAuthorizationObject(authorization: Authorization): AuthorizationDTO {
    return {
      name: authorization.name,
      type: authorization.type as AuthorizationEnum,
      data: authorization.value as any,
    };
  }

  public toResponse(authorization: Authorization): AuthorizationResponse {
    return {
      id: authorization.id,
      name: authorization.name,
      type: authorization.type,
    };
  }
}
