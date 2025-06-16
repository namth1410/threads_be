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
import { DataSource, EntityManager, Like, Repository } from 'typeorm';
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
    manager?: EntityManager,
  ): Promise<ResponseDto<ThreadEntity>> {
    if (manager) {
      const saved = await manager.getRepository(ThreadEntity).save(threadData);
      return new ResponseDto(saved, 'Thread created', 201);
    }

    // Nếu không có manager, dùng repository mặc định
    const saved = await this.threadsRepository.createEntity(threadData);
    return saved;
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

  async attachMedia(
    threadId: number,
    files: Express.Multer.File[],
    manager?: EntityManager,
  ): Promise<string[]> {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    const uploadedFiles: string[] = [];

    try {
      const mediaEntities = await Promise.all(
        files.map(async (file) => {
          const fileName = await this.minioService.uploadFile(bucketName, file);
          uploadedFiles.push(fileName); // để rollback nếu lỗi

          const fileUrl = await this.minioService.getPublicUrl(
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

      await this.bulkAddMediaToThread(mediaEntities, manager); // truyền manager vào
      return uploadedFiles;
    } catch (error) {
      // Rollback MinIO files
      await Promise.all(
        uploadedFiles.map((fileName) =>
          this.minioService.removeFile(bucketName, fileName),
        ),
      );
      throw error;
    }
  }

  async bulkAddMediaToThread(
    mediaList: {
      threadId: number;
      url: string;
      type: string;
      fileName: string;
    }[],
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(MediaEntity)
      : this.mediaRepository;

    const entities = mediaList.map((media) =>
      repo.create({
        url: media.url,
        type: media.type,
        fileName: media.fileName, // bạn đang bị lỗi chỗ này: `fileName: media.type` sai!
        thread: { id: media.threadId },
      }),
    );

    await repo.save(entities);
  }
}
