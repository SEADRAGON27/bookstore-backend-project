import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'refresh_sessions' })
export class RefreshSessionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @Index()
  finger_print: string;

  @Column()
  @Index()
  refresh_token: string;

  @ManyToOne(() => UserEntity, (user) => user.refresh_session, { onDelete: 'CASCADE' })
  user: UserEntity;
}
