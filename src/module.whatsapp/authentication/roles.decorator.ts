import { SetMetadata } from '@nestjs/common';
import { Role } from '../database/models/user.entity';

export const AUTHORIZED_TYPES_KEY = 'authorized_types';
export const Authorized = (...authorizedTypes: Role[]) =>
  SetMetadata(AUTHORIZED_TYPES_KEY, authorizedTypes);
