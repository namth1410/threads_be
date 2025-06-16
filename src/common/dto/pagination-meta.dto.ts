export class PaginationMetaDto {
  count: number; // Tổng số bản ghi trong trang hiện tại
  totalPages: number; // Tổng số trang
  currentPage: number; // Trang hiện tại
  limit: number; // Số bản ghi tối đa trên mỗi trang

  constructor(
    count: number,
    totalPages: number,
    currentPage: number,
    limit: number,
  ) {
    this.count = count;
    this.totalPages = totalPages;
    this.currentPage = currentPage;
    this.limit = limit; // Khởi tạo thuộc tính limit
  }
}
