import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${level}] ${context || 'N/A'}: ${message}`;
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      dirname: 'logs', // Thư mục lưu log
      filename: '%DATE%-app.log', // Định dạng tên file, ví dụ: 2024-11-06-app.log
      datePattern: 'YYYY-MM-DD', // Tạo file mới hàng ngày
      level: 'debug', // Mức log (info, error,...)
      maxSize: '20m', // Giới hạn kích thước mỗi file log, ví dụ: 20MB
      maxFiles: '14d', // Giữ log trong 14 ngày, sau đó tự động xóa
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        }),
      ),
    }),
  ],
};
