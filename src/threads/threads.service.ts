// threads.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { MediaEntity } from 'src/minio/media.entity';
import { MinioService } from 'src/minio/minio.service';
import { DataSource, EntityManager, Like } from 'typeorm';
import { ThreadsPaginationDto } from './dto/threads-pagination.dto';
import { ThreadEntity } from './thread.entity'; // Giả sử bạn đã có một entity cho Thread
import { ThreadsRepository } from './threads.repository';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly threadsRepository: ThreadsRepository,
    private readonly minioService: MinioService,
    private readonly dataSource: DataSource,
  ) {}

  async getAllThreads(
    paginationDto: ThreadsPaginationDto,
  ): Promise<{ data: ThreadEntity[]; meta: PaginationMetaDto }> {
    const filters: any = { ...paginationDto.filters }; // Lấy các bộ lọc hiện có

    if (paginationDto.content) {
      filters.content = Like(`%${paginationDto.content}%`); // Thêm điều kiện lọc cho nội dung
    }

    const { data, total } = await this.threadsRepository.getAllEntity({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.order }
        : undefined,
      where: filters,
      relations: ['media', 'user'],
    });

    const meta = new PaginationMetaDto(
      data.length,
      Math.ceil(total / paginationDto.limit),
      paginationDto.page,
      paginationDto.limit,
    );

    return { data, meta };
  }

  async create(
    threadData: Partial<ThreadEntity>,
    manager?: EntityManager,
  ): Promise<ThreadEntity> {
    if (manager) {
      const saved = await manager.getRepository(ThreadEntity).save(threadData);
      return saved;
    }

    // Nếu không có manager, dùng repository mặc định
    const saved = await this.threadsRepository.createEntity(threadData);
    return saved;
  }

  async update(
    id: number,
    threadData: Partial<ThreadEntity>,
  ): Promise<ThreadEntity> {
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
    const uploadedFileNames: string[] = [];

    if (!manager) {
      manager = this.dataSource.manager;
    }

    const bucketName = process.env.MINIO_BUCKET_NAME;

    const repo = manager.getRepository(MediaEntity);

    for (const file of files) {
      // Upload trực tiếp lên MinIO từ bộ nhớ
      const storedFileName = await this.minioService.uploadFile(
        bucketName,
        file,
      );

      uploadedFileNames.push(storedFileName);

      const type = file.mimetype.startsWith('image') ? 'image' : 'video';

      const publicUrl = this.minioService.getPublicUrl(
        bucketName,
        storedFileName,
      );

      const media = repo.create({
        url: publicUrl,
        type,
        fileName: storedFileName,
        thread: { id: threadId } as any,
      });

      await repo.save(media);
    }

    return uploadedFileNames;
  }
}
