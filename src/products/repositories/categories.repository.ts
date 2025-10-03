import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Repository } from 'typeorm';
import { ProductCategoryEntity } from '../entities/product-category.entity';

@Injectable()
export class CategoriesRepository extends BaseRepository<ProductCategoryEntity> {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepository: Repository<ProductCategoryEntity>,
  ) {
    super(categoryRepository);
  }

  async findActiveCategories(): Promise<ProductCategoryEntity[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }
}
