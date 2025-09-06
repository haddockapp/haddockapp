import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permissions: string[]) => SetMetadata(REQUIRED_PERMISSION_KEY, permissions);

