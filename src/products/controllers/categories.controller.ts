import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ProductCategoryEntity } from '../entities/product-category.entity';
import { CategoriesService } from '../services/categories.service';

@ApiTags('product-categories')
@Controller('product-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all product categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories.',
    type: [ProductCategoryEntity],
  })
  @Roles(Role.SUPERADMIN, Role.USER)
  @UseGuards(RolesGuard)
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PageResponseDto<ProductCategoryEntity>> {
    const { data, meta } =
      await this.categoriesService.getAllCategories(paginationDto);

    return new PageResponseDto<ProductCategoryEntity>(
      data,
      meta,
      'Categories retrieved successfully',
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Retrieve all active product categories' })
  @ApiResponse({
    status: 200,
    description: 'List of active categories.',
    type: [ProductCategoryEntity],
  })
  @Roles(Role.SUPERADMIN, Role.USER)
  @UseGuards(RolesGuard)
  async findActive(): Promise<ResponseDto<ProductCategoryEntity[]>> {
    const categories = await this.categoriesService.getActiveCategories();

    return new ResponseDto(
      categories,
      'Active categories retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details.',
    type: ProductCategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Roles(Role.SUPERADMIN, Role.USER)
  @UseGuards(RolesGuard)
  async findOne(
    @Param('id') id: number,
  ): Promise<ResponseDto<ProductCategoryEntity>> {
    const category = await this.categoriesService.getCategoryById(id);

    return new ResponseDto(category, 'Category retrieved successfully');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: ProductCategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Roles(Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseDto<ProductCategoryEntity>> {
    const category =
      await this.categoriesService.createCategory(createCategoryDto);

    return new ResponseDto(category, 'Category created successfully', 201);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: ProductCategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Roles(Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseDto<ProductCategoryEntity>> {
    const updatedCategory = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
    );

    return new ResponseDto(updatedCategory, 'Category updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Roles(Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoriesService.deleteCategory(id);
  }
}
