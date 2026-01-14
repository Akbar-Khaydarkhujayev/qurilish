export default interface IPaginatedResponse<T> {
  data: T[];
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

export interface IByIdResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface IReqParams {
  [key: string]: string | number | boolean | undefined;
}

export interface RowItemProps<T> {
  row: T;
  click?: () => void;
  edit?: () => void;
  remove?: () => void;
  delete?: () => void;
}
