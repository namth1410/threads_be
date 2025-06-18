import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

interface BaseEntity {
  id: number;
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  createQueryBuilder(alias: string = 'entity') {
    return this.repository.createQueryBuilder(alias);
  }

  async getAllEntity(
    options?: FindManyOptions<T>,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async getEntityByCriteria(criteria: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where: criteria });
  }

  // Thêm phiên bản linh hoạt hơn
  async findOneByOptions(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async updateEntity(id: number, data: DeepPartial<T>): Promise<T> {
    const existingEntity = await this.getEntityByCriteria({
      id,
    } as FindOptionsWhere<T>);

    if (!existingEntity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    this.repository.merge(existingEntity, data);
    const updatedEntity = await this.repository.save(existingEntity);

    return updatedEntity;
  }

  async deleteEntity(criteria: FindOptionsWhere<T>): Promise<void> {
    const result = await this.repository.delete(criteria);

    if (result.affected === 0) {
      throw new NotFoundException(`Entity not found with given criteria`);
    }
  }

  async incrementEntity(
    criteria: FindOptionsWhere<T>,
    field: keyof T,
    value: number,
  ): Promise<void> {
    await this.repository.increment(criteria, field as string, value);
  }

  async decrementEntity(
    criteria: FindOptionsWhere<T>,
    field: keyof T,
    value: number,
  ): Promise<void> {
    await this.repository.decrement(criteria, field as string, value);
  }
}
