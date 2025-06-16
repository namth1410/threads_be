import { Role } from 'src/common/enums/role.enum';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from '../comments/comment.entity';
import { FollowerEntity } from '../followers/follower.entity';
import { LikeEntity } from '../likes/like.entity';
import { ThreadEntity } from '../threads/thread.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // Bảo mật: không tự động select password
  password: string;

  @Column({ default: 1 })
  tokenVersion: number;

  @Column({ nullable: true })
  email: string;

  @Index()
  @Column({ unique: true })
  displayId: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => ThreadEntity, (thread) => thread.user)
  threads: ThreadEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @OneToMany(() => FollowerEntity, (follower) => follower.follower)
  followers: FollowerEntity[];

  @OneToMany(() => FollowerEntity, (follower) => follower.followed)
  following: FollowerEntity[];

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
