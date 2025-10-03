import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductsPaginationDto } from '../dto/products-pagination.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';
import { ProductCondition } from '../enums/product-condition.enum';
import { ProductStatus } from '../enums/product-status.enum';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService;

  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiResponse({
    status: 200,
    description: 'List of products.',
    type: [ProductEntity],
  })
  @Roles(Role.SUPERADMIN, Role.USER)
  @UseGuards(RolesGuard)
  async findAll(
    @Query() paginationDto: ProductsPaginationDto,
  ): Promise<PageResponseDto<ProductResponseDto>> {
    const { data, meta } =
      await this.productsService.getAllProducts(paginationDto);

    const productResponseDtos = data.map(
      (product) =>
        new ProductResponseDto(
          product.id,
          product.title,
          product.description,
          product.price,
          product.condition,
          product.status,
          product.viewCount,
          product.favoriteCount,
          product.isNegotiable,
          product.seller,
          product.createdAt,
          product.updatedAt,
          product.originalPrice,
          product.location,
          product.tags ? JSON.parse(product.tags) : undefined,
          product.category,
          product.images,
        ),
    );

    return new PageResponseDto<ProductResponseDto>(
      productResponseDtos,
      meta,
      'Products retrieved successfully',
    );
  }

  @Get('my-products')
  @ApiOperation({ summary: 'Retrieve products for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user products.',
    type: [ProductEntity],
  })
  async findUserProducts(
    @Request() req: any,
    @Query() paginationDto: ProductsPaginationDto,
  ): Promise<PageResponseDto<ProductResponseDto>> {
    const userId = req.user.id;

    const { data, meta } = await this.productsService.getUserProducts(
      userId,
      paginationDto,
    );

    const productResponseDtos = data.map(
      (product) =>
        new ProductResponseDto(
          product.id,
          product.title,
          product.description,
          product.price,
          product.condition,
          product.status,
          product.viewCount,
          product.favoriteCount,
          product.isNegotiable,
          product.seller,
          product.createdAt,
          product.updatedAt,
          product.originalPrice,
          product.location,
          product.tags ? JSON.parse(product.tags) : undefined,
          product.category,
          product.images,
        ),
    );

    return new PageResponseDto<ProductResponseDto>(
      productResponseDtos,
      meta,
      'User products retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details.',
    type: ProductEntity,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @Param('id') id: number,
  ): Promise<ResponseDto<ProductResponseDto>> {
    const product = await this.productsService.getProductById(id);

    const productResponse = new ProductResponseDto(
      product.id,
      product.title,
      product.description,
      product.price,
      product.condition,
      product.status,
      product.viewCount,
      product.favoriteCount,
      product.isNegotiable,
      product.seller,
      product.createdAt,
      product.updatedAt,
      product.originalPrice,
      product.location,
      product.tags ? JSON.parse(product.tags) : undefined,
      product.category,
      product.images,
    );

    return new ResponseDto(productResponse, 'Product retrieved successfully');
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create product payload',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'iPhone 15 Pro Max' },
        description: { type: 'string', example: 'Brand new, fullbox' },
        price: { type: 'number', example: 1000 },
        originalPrice: { type: 'number', example: 1200 },
        condition: { type: 'string', example: ProductCondition.GOOD },
        status: { type: 'string', example: ProductStatus.DRAFT },
        location: { type: 'string', example: 'Hanoi' },
        isNegotiable: { type: 'boolean', example: true },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['Apple', 'Phone'],
        },
        categoryId: { type: 'number', example: 1 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product images',
        },
      },
      required: ['title', 'description', 'price'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: ProductEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ResponseDto<ProductResponseDto>> {
    const userId = req.user.id;
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      this.logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException('User not found');
    }

    const product = await this.productsService.createProduct(
      createProductDto,
      user,
      files,
    );

    const productResponse = new ProductResponseDto(
      product.id,
      product.title,
      product.description,
      product.price,
      product.condition,
      product.status,
      product.viewCount,
      product.favoriteCount,
      product.isNegotiable,
      product.seller,
      product.createdAt,
      product.updatedAt,
      product.originalPrice,
      product.location,
      product.tags ? JSON.parse(product.tags) : undefined,
      product.category,
      product.images,
    );

    return new ResponseDto(
      productResponse,
      'Product created successfully',
      201,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: ProductEntity,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ): Promise<ResponseDto<ProductResponseDto>> {
    const userId = req.user.id;
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto,
      userId,
    );

    const productResponse = new ProductResponseDto(
      updatedProduct.id,
      updatedProduct.title,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.condition,
      updatedProduct.status,
      updatedProduct.viewCount,
      updatedProduct.favoriteCount,
      updatedProduct.isNegotiable,
      updatedProduct.seller,
      updatedProduct.createdAt,
      updatedProduct.updatedAt,
      updatedProduct.originalPrice,
      updatedProduct.location,
      updatedProduct.tags ? JSON.parse(updatedProduct.tags) : undefined,
      updatedProduct.category,
      updatedProduct.images,
    );

    return new ResponseDto(productResponse, 'Product updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN, Role.USER)
  async remove(@Param('id') id: number, @Request() req: any): Promise<void> {
    const userId = req.user.id;
    return this.productsService.deleteProduct(id, userId);
  }
}
