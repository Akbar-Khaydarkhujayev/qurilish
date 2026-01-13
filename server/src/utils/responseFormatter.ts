import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const success = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

export const error = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  data?: any
): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const created = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  success(res, data, message, 201);
};

export const notFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  error(res, message, 404);
};

export const badRequest = (
  res: Response,
  message: string = 'Bad request',
  data?: any
): void => {
  error(res, message, 400, data);
};

export const unauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  error(res, message, 401);
};

export const forbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  error(res, message, 403);
};

export const conflict = (
  res: Response,
  message: string = 'Resource already exists'
): void => {
  error(res, message, 409);
};
