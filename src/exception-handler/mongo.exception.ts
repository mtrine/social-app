import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
  } from '@nestjs/common';
  import { MongoServerError } from 'mongodb';
  
  @Catch(MongoServerError)
  export class MongoExceptionFilter implements ExceptionFilter {
    catch(exception: MongoServerError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error with MongoDB';
  
      // Phân loại lỗi dựa trên mã lỗi
      switch (exception.code) {
        case 11000: // Duplicate key error
          status = HttpStatus.CONFLICT;
          message = 'Duplicate key error: A record with the same value already exists.';
          break;
        case 121: // Document validation error
          status = HttpStatus.BAD_REQUEST;
          message = 'Document validation failed. Please check your input.';
          break;
        case 50: // Exceeded time limit for an operation
          status = HttpStatus.REQUEST_TIMEOUT;
          message = 'MongoDB operation timed out. Please try again later.';
          break;
        default: // Các lỗi khác
          message = exception.message || message;
          break;
      }
  
      // Trả về response với lỗi cụ thể
      response.status(status).json({
        statusCode: status,
        message,
        error: exception.message,
      });
    }
  }
  