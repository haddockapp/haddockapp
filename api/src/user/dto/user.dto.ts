import { User, Authorization } from '@prisma/client';

export type PersistedUserDto = User & { authorization?: Authorization };