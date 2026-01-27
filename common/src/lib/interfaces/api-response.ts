export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
  statusCode?: number;
}
