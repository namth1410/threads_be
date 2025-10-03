import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';
import { MinioService } from 'src/minio/minio.service';
import { UserEntity } from 'src/users/user.entity';
import { DataSource, EntityManager, Like, Between } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductsPaginationDto } from '../dto/products-pagination.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductImageEntity } from '../entities/product-image.entity';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly minioService: MinioService,
    private readonly dataSource: DataSource,
  ) {}

  async getAllProducts(
    paginationDto: ProductsPaginationDto,
  ): Promise<{ data: ProductEntity[]; meta: PaginationMetaDto }> {
    const filters: any = { ...paginationDto.filters };

    // Search by title
    if (paginationDto.title) {
      filters.title = Like(`%${paginationDto.title}%`);
    }

    // Filter by category
    if (paginationDto.categoryId) {
      filters.category = { id: paginationDto.categoryId };
    }

    // Filter by condition
    if (paginationDto.condition) {
      filters.condition = paginationDto.condition;
    }

    // Filter by status
    if (paginationDto.status) {
      filters.status = paginationDto.status;
    }

    // Price range filter
    if (
      paginationDto.minPrice !== undefined ||
      paginationDto.maxPrice !== undefined
    ) {
      const minPrice = paginationDto.minPrice || 0;
      const maxPrice = paginationDto.maxPrice || Number.MAX_SAFE_INTEGER;
      filters.price = Between(minPrice, maxPrice);
    }

    // Filter by location
    if (paginationDto.location) {
      filters.location = Like(`%${paginationDto.location}%`);
    }

    // Filter by seller
    if (paginationDto.sellerId) {
      filters.seller = { id: paginationDto.sellerId };
    }

    const { data, total } = await this.productsRepository.getAllEntity({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      order: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.order }
        : { createdAt: 'DESC' },
      where: filters,
      relations: ['seller', 'category', 'images'],
    });

    const meta = new PaginationMetaDto(
      data.length,
      Math.ceil(total / paginationDto.limit),
      paginationDto.page,
      paginationDto.limit,
    );

    return { data, meta };
  }

  async getProductById(id: number): Promise<ProductEntity> {
    const product = await this.productsRepository.findOneByOptions({
      where: { id },
      relations: ['seller', 'category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Increment view count
    await this.productsRepository.incrementViewCount(id);

    return product;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    seller: UserEntity,
    files?: Express.Multer.File[],
  ): Promise<ProductEntity> {
    return await this.dataSource.transaction(async (manager) => {
      // Prepare product data
      const productData: Partial<ProductEntity> = {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        originalPrice: createProductDto.originalPrice,
        condition: createProductDto.condition,
        status: createProductDto.status || ProductStatus.DRAFT,
        location: createProductDto.location,
        isNegotiable: createProductDto.isNegotiable ?? true,
        tags: createProductDto.tags
          ? JSON.stringify(createProductDto.tags)
          : null,
        seller: seller,
      };

      // Add category if provided
      if (createProductDto.categoryId) {
        productData.category = { id: createProductDto.categoryId } as any;
      }

      // Create product
      const product = await manager
        .getRepository(ProductEntity)
        .save(productData);

      // Attach images if provided
      if (files && files.length > 0) {
        await this.attachImages(product.id, files, manager);
      }

      return product;
    });
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ): Promise<ProductEntity> {
    const product = await this.productsRepository.findOneByOptions({
      where: { id },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Check if user is the seller
    if (product.seller.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    const updateData: Partial<ProductEntity> = {};

    // Copy fields from DTO, excluding tags and categoryId
    Object.keys(updateProductDto).forEach((key) => {
      if (key !== 'tags' && key !== 'categoryId') {
        updateData[key] = updateProductDto[key];
      }
    });

    // Handle tags
    if (updateProductDto.tags) {
      updateData.tags = JSON.stringify(updateProductDto.tags);
    }

    // Handle category
    if (updateProductDto.categoryId) {
      updateData.category = { id: updateProductDto.categoryId } as any;
    }

    return this.productsRepository.updateEntity(id, updateData);
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(ProductEntity, {
        where: { id },
        relations: ['seller', 'images'],
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      // Check if user is the seller
      if (product.seller.id !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this product',
        );
      }

      // Delete images from MinIO
      const bucketName = process.env.MINIO_BUCKET_NAME;
      for (const image of product.images) {
        await this.minioService.removeFile(bucketName, image.fileName);
        await manager.delete(ProductImageEntity, image.id);
      }

      // Delete product
      await manager.delete(ProductEntity, id);
    });
  }

  async attachImages(
    productId: number,
    files: Express.Multer.File[],
    manager?: EntityManager,
  ): Promise<string[]> {
    const uploadedFileNames: string[] = [];

    if (!manager) {
      manager = this.dataSource.manager;
    }

    const bucketName = process.env.MINIO_BUCKET_NAME;
    const repo = manager.getRepository(ProductImageEntity);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Upload to MinIO
      const storedFileName = await this.minioService.uploadFile(
        bucketName,
        file,
      );

      uploadedFileNames.push(storedFileName);

      const publicUrl = this.minioService.getPublicUrl(
        bucketName,
        storedFileName,
      );

      const image = repo.create({
        url: publicUrl,
        fileName: storedFileName,
        isPrimary: i === 0, // First image is primary
        sortOrder: i,
        product: { id: productId } as any,
      });

      await repo.save(image);
    }

    return uploadedFileNames;
  }

  async getUserProducts(
    userId: number,
    paginationDto: ProductsPaginationDto,
  ): Promise<{ data: ProductEntity[]; meta: PaginationMetaDto }> {
    paginationDto.sellerId = userId;
    return this.getAllProducts(paginationDto);
  }
}
