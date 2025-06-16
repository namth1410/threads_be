import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { PageResponseDto } from '../dto/page-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';
import { ResponseDto } from '../dto/response.dto';

interface BaseEntity {
  id: number;
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  async getAllEntity(
    options?: FindManyOptions<T>,
  ): Promise<PageResponseDto<T>> {
    const [result, total] = await this.repository.findAndCount(options);

    const pagination = options?.take
      ? {
          count: result.length,
          totalPages: Math.ceil(total / options.take),
          currentPage: options.skip ? options.skip / options.take + 1 : 1,
          limit: options.take,
        }
      : undefined;

    return new PageResponseDto<T>(
      result,
      pagination
        ? new PaginationMetaDto(
            pagination.count,
            pagination.totalPages,
            pagination.currentPage,
            pagination.limit,
          )
        : undefined,
      'Data retrieved successfully',
      200,
    );
  }

  async getEntityById(id: number): Promise<ResponseDto<T> | null> {
    const where: FindOptionsWhere<T> = { id } as FindOptionsWhere<T>;
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      return null;
    }

    return new ResponseDto(entity, 'Entity retrieved successfully', 200);
  }

  async getEntityByCriteria(criteria: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where: criteria });
  }

  // Thêm phiên bản linh hoạt hơn
  async findOneByOptions(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  // Thêm phương thức tìm theo username
  async findByUsername(username: string): Promise<T | null> {
    const where: FindOptionsWhere<T> = {
      username,
    } as unknown as FindOptionsWhere<T>;
    return this.repository.findOne({ where });
  }

  async createEntity(data: DeepPartial<T>): Promise<ResponseDto<T>> {
    const entity = this.repository.create(data);
    const savedEntity = await this.repository.save(entity);
    return new ResponseDto(savedEntity, 'Entity created successfully', 201);
  }

  async updateEntity(
    id: number,
    data: DeepPartial<T>,
  ): Promise<ResponseDto<T>> {
    // Kiểm tra xem bản ghi có tồn tại không
    const existingEntity = await this.getEntityById(id);

    if (!existingEntity) {
      throw new Error(`Entity với id ${id} không tồn tại`);
    }

    // Cập nhật dữ liệu
    this.repository.merge(existingEntity.data, data); // Merge dữ liệu mới vào bản ghi đã tồn tại

    // Lưu bản ghi đã cập nhật
    await this.repository.save(existingEntity.data);

    return new ResponseDto(
      existingEntity.data,
      'Entity cập nhật thành công',
      200,
    );
  }

  async deleteEntity(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }
}
