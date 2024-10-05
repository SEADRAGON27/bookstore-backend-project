import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'refresh_sessions' })
export class RefreshSessionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'fingerprint' })
  @Index('finger_print_index')
  fingerprint: string;

  @Column({ name: 'refresh_token' })
  @Index('refresh_token_index')
  refreshToken: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshSession, { onDelete: 'CASCADE' })
  user: UserEntity;
}
