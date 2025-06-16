// threads.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { MediaEntity } from 'src/minio/media.entity';
import { MinioService } from 'src/minio/minio.service';
import { DataSource, Like, Repository } from 'typeorm';
import { ThreadsPaginationDto } from './dto/threads-pagination.dto';
import { ThreadEntity } from './thread.entity'; // Giả sử bạn đã có một entity cho Thread
import { ThreadsRepository } from './threads.repository';

@Injectable()
export class ThreadsService {
  constructor(
    // @InjectRepository(ThreadEntity)
    private threadsRepository: ThreadsRepository,

    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,

    private readonly minioService: MinioService, // Inject MinioService

    private readonly dataSource: DataSource,
  ) {}

  async getAllThreads(
    paginationDto: ThreadsPaginationDto,
  ): Promise<PageResponseDto<ThreadEntity>> {
    const filters: any = { ...paginationDto.filters }; // Lấy các bộ lọc hiện có

    if (paginationDto.content) {
      filters.content = Like(`%${paginationDto.content}%`); // Thêm điều kiện lọc cho nội dung
    }

    return this.threadsRepository.getAllEntity({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.order }
        : undefined,
      where: filters,
      relations: ['media', 'user'],
    });
  }

  async create(
    threadData: Partial<ThreadEntity>,
  ): Promise<ResponseDto<ThreadEntity>> {
    return this.threadsRepository.createEntity(threadData);
  }

  async update(
    id: number,
    threadData: Partial<ThreadEntity>,
  ): Promise<ResponseDto<ThreadEntity> | null> {
    return this.threadsRepository.updateEntity(id, threadData);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Truy vấn tất cả media liên quan đến thread
      const thread = await manager.findOne(ThreadEntity, {
        where: { id },
        relations: ['media', 'user'],
      });

      if (!thread) {
        throw new NotFoundException(`Thread with id ${id} not found`);
      }

      // Kiểm tra xem người dùng có phải là chủ sở hữu thread không
      if (thread.user.id !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this thread',
        );
      }

      // Xóa từng file khỏi MinIO
      const bucketName = process.env.MINIO_BUCKET_NAME;
      for (const media of thread.media) {
        await this.minioService.removeFile(bucketName, media.fileName);

        // Xóa bản ghi media
        await manager.delete(MediaEntity, media.id); // Sử dụng manager để xóa
      }

      // Sau khi xóa hết file trên MinIO và media, xóa thread trong database
      await manager.delete(ThreadEntity, id); // Sử dụng manager để xóa
    });
  }

  async addMediaToThread(
    threadId: number,
    url: string,
    type: string,
    fileName: string,
  ) {
    const media = this.mediaRepository.create({
      url,
      type,
      fileName,
      thread: { id: threadId },
    });
    await this.mediaRepository.save(media);
  }

  async attachMedia(threadId: number, files: Express.Multer.File[]) {
    const bucketName = process.env.MINIO_BUCKET_NAME;

    const mediaEntities = await Promise.all(
      files.map(async (file) => {
        const fileName = await this.minioService.uploadFile(bucketName, file);
        const fileUrl = await this.minioService.getFileUrl(
          bucketName,
          fileName,
        );
        const type = file.mimetype.startsWith('image') ? 'image' : 'video';

        return {
          threadId,
          url: fileUrl,
          type,
          fileName,
        };
      }),
    );

    // Thực hiện bulk insert 1 lần
    await this.bulkAddMediaToThread(mediaEntities);
  }

  async bulkAddMediaToThread(
    mediaList: {
      threadId: number;
      url: string;
      type: string;
      fileName: string;
    }[],
  ) {
    const entities = mediaList.map((media) =>
      this.mediaRepository.create({
        url: media.url,
        type: media.type,
        fileName: media.type,
        thread: { id: media.threadId },
      }),
    );

    await this.mediaRepository.save(entities); // bulk insert
  }
}
