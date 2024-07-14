import { UserType } from '../types/user.type';

export interface UserResponse {
  user: UserType & { token: string } & { tokenExpiration: number };
}
