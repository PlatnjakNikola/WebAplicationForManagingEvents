export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
