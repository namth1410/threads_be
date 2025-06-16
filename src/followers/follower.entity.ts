import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('followers')
export class FollowerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.following)
  follower: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  followed: UserEntity;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
