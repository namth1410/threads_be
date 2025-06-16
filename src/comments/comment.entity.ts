import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ThreadEntity } from '../threads/thread.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  user: UserEntity;

  @ManyToOne(() => ThreadEntity, (thread) => thread.comments)
  thread: ThreadEntity;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
