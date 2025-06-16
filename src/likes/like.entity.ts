import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ThreadEntity } from '../threads/thread.entity';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;

  @ManyToOne(() => ThreadEntity, (thread) => thread.likes)
  thread: ThreadEntity;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
