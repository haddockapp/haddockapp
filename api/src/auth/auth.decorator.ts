import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PUBLIC_CONFIG_KEY = 'isPublicConfig';
export const PublicConfig = () => SetMetadata(IS_PUBLIC_CONFIG_KEY, true);
