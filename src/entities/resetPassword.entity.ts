import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('reset_password')
export class ResetPasswordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  expires_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.resetPasswordTokens)
  user: UserEntity;
}
