import { ConflictException, Injectable } from '@nestjs/common';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { UserEntity } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getByCriteria(
    options: FindOneOptions<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOneByOptions(options);
  }

  async getUserWithPasswordById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOneByOptions({
      where: { id },
      select: [
        'id',
        'username',
        'password',
        'email',
        'displayId',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async getAllUsers(
    paginationDto: PaginationDto,
  ): Promise<{ data: UserEntity[]; meta: PaginationMetaDto }> {
    const { page, limit, sortBy, order, filters } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      Object.assign(where, filters);
    }

    const options: FindManyOptions<UserEntity> = {
      take: limit,
      skip,
      order: sortBy ? { [sortBy]: order } : undefined,
      where,
    };

    const { data, total } = await this.usersRepository.getAllEntity(options);

    const meta = new PaginationMetaDto(
      data.length,
      Math.ceil(total / limit),
      page,
      limit,
    );

    return { data, meta };
  }

  async getUserById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.getEntityByCriteria({ id }); // Sử dụng phương thức từ UsersRepository
  }

  async getHashPasswordByUsername(
    username: string,
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOneByOptions({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'email',
        'displayId',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async createUser(data: Partial<UserEntity>): Promise<UserEntity> {
    const existingUser = await this.usersRepository.getEntityByCriteria({
      username: data.username,
    });
    if (existingUser) {
      throw new ConflictException('Username already exists'); // Ném lỗi nếu username đã tồn tại
    }
    return this.usersRepository.createEntity(data); // Sử dụng phương thức từ UsersRepository
  }

  async updateUser(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    // Kiểm tra xem displayId có tồn tại không
    if (data.displayId) {
      const existingUser = await this.usersRepository.getEntityByCriteria({
        displayId: data.displayId,
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Display ID must be unique');
      }
    }

    return this.usersRepository.updateEntity(id, data);
  }

  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.deleteEntity({ id }); // Sử dụng phương thức từ UsersRepository
  }
}
