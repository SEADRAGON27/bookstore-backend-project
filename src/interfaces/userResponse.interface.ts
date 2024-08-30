import { UserEntity } from '../entities/user.entity';
import { UserType } from '../types/user.type';

export interface UserResponse {
  user: UserType & { token: string } & { tokenExpiration: number };
}

export interface CreateUserResponse {
  user: UserEntity;
  refreshToken: string;
}
