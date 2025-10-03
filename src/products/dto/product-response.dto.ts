import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from 'src/users/user.entity';
import { ProductCondition } from '../enums/product-condition.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductCategoryEntity } from '../entities/product-category.entity';
import { ProductImageEntity } from '../entities/product-image.entity';

export class ProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  originalPrice?: number;

  @ApiProperty({ enum: ProductCondition })
  condition: ProductCondition;

  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  favoriteCount: number;

  @ApiProperty()
  isNegotiable: boolean;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiProperty()
  seller: UserEntity;

  @ApiPropertyOptional()
  category?: ProductCategoryEntity;

  @ApiPropertyOptional({ type: [ProductImageEntity] })
  images?: ProductImageEntity[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(
    id: number,
    title: string,
    description: string,
    price: number,
    condition: ProductCondition,
    status: ProductStatus,
    viewCount: number,
    favoriteCount: number,
    isNegotiable: boolean,
    seller: UserEntity,
    createdAt: Date,
    updatedAt: Date,
    originalPrice?: number,
    location?: string,
    tags?: string[],
    category?: ProductCategoryEntity,
    images?: ProductImageEntity[],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.originalPrice = originalPrice;
    this.condition = condition;
    this.status = status;
    this.location = location;
    this.viewCount = viewCount;
    this.favoriteCount = favoriteCount;
    this.isNegotiable = isNegotiable;
    this.tags = tags;
    this.seller = seller;
    this.category = category;
    this.images = images;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
