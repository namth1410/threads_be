import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export async function paginate<Entity>(
  queryBuilder: SelectQueryBuilder<Entity>,
  paginationDto: PaginationDto,
): Promise<any> {
  const { page, limit, sortBy, order, filters } = paginationDto;

  // Xác định giá trị mặc định nếu không có
  const currentPage = page || 1;
  const pageSize = limit || 10;

  // Áp dụng bộ lọc

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`"${key}" = :value`, { value });
      }
    }
  }

  // Áp dụng sắp xếp
  if (sortBy) {
    queryBuilder.orderBy(sortBy, order);
  }

  // Pagination
  const [result, total] = await queryBuilder
    .skip((currentPage - 1) * pageSize) // Tính skip
    .take(pageSize) // Tính take
    .getManyAndCount();
  
  return {
    data: result,
    count: total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: currentPage,
  };
}
