// session.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ unique: true })
  token: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: Date;
}
