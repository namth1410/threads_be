import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ProductCategoryEntity } from '../entities/product-category.entity';
import { CategoriesRepository } from '../repositories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async getAllCategories(
    paginationDto: PaginationDto,
  ): Promise<{ data: ProductCategoryEntity[]; meta: PaginationMetaDto }> {
    const { data, total } = await this.categoriesRepository.getAllEntity({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.order }
        : { name: 'ASC' },
      where: paginationDto.filters,
    });

    const meta = new PaginationMetaDto(
      data.length,
      Math.ceil(total / paginationDto.limit),
      paginationDto.page,
      paginationDto.limit,
    );

    return { data, meta };
  }

  async getActiveCategories(): Promise<ProductCategoryEntity[]> {
    return this.categoriesRepository.findActiveCategories();
  }

  async getCategoryById(id: number): Promise<ProductCategoryEntity> {
    const category = await this.categoriesRepository.getEntityByCriteria({
      id,
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ProductCategoryEntity> {
    return this.categoriesRepository.createEntity(createCategoryDto);
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ProductCategoryEntity> {
    return this.categoriesRepository.updateEntity(id, updateCategoryDto);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.categoriesRepository.deleteEntity({ id });
  }
}
