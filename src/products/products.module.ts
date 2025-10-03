import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { MinioModule } from 'src/minio/minio.module';
import { UsersModule } from 'src/users/users.module';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { ProductCategoryEntity } from './entities/product-category.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { ProductEntity } from './entities/product.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { ProductsRepository } from './repositories/products.repository';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductCategoryEntity,
      ProductImageEntity,
    ]),
    UsersModule,
    MinioModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  providers: [
    ProductsService,
    CategoriesService,
    ProductsRepository,
    CategoriesRepository,
  ],
  controllers: [ProductsController, CategoriesController],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule {}
