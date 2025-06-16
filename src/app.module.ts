import { Logger, Module } from '@nestjs/common';
import { WinstonLogger, WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { CommentsModule } from './comments/comments.module';
import { DbModule } from './db/db.module';
import { FollowersModule } from './followers/followers.module';
import { LikesModule } from './likes/likes.module';
import { winstonConfig } from './logger/winston.config';
import { MinioModule } from './minio/minio.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SessionsModule } from './sessions/sessions.module';
import { ThreadsModule } from './threads/threads.module';
import { UsersModule } from './users/users.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    AuthModule,
    CacheModule,
    CommentsModule,
    DbModule,
    FollowersModule,
    LikesModule,
    UsersModule,
    ThreadsModule,
    SessionsModule,
    MinioModule,
    NotificationsModule,

    // RedisModule.forRoot({
    //   type: 'single',
    //   url: 'redis://36.50.176.49:6379',
    // }),
    WinstonModule.forRoot(winstonConfig),

    MeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: Logger,
      useClass: WinstonLogger,
    },
  ],
})
export class AppModule {}
