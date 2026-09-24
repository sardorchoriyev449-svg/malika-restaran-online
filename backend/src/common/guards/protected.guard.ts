import { SetMetadata } from '@nestjs/common';

export const PROTECTED_KEY = 'isProtected';
export const Protected = () => SetMetadata(PROTECTED_KEY, true);