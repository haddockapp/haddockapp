import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { TokenUser } from './guard/token.guard';

export const CurrentUser = createParamDecorator(
  (_1: unknown, context: ExecutionContext): User | TokenUser => {
    return context.switchToHttp().getRequest().user;
  },
);
