import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsRepository extends BaseRepository<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {
    super(productRepository);
  }

  async incrementViewCount(productId: number): Promise<void> {
    await this.productRepository.increment({ id: productId }, 'viewCount', 1);
  }

  async incrementFavoriteCount(productId: number): Promise<void> {
    await this.productRepository.increment(
      { id: productId },
      'favoriteCount',
      1,
    );
  }

  async decrementFavoriteCount(productId: number): Promise<void> {
    await this.productRepository.decrement(
      { id: productId },
      'favoriteCount',
      1,
    );
  }
}
