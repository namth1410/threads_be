import { ThreadEntity } from 'src/threads/thread.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('media')
export class MediaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @Column('text')
  type: string; // 'image' hoặc 'video'

  @Column('text')
  fileName: string; // tên file

  @ManyToOne(() => ThreadEntity, (thread) => thread.media)
  thread: ThreadEntity;
}
