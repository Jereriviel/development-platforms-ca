export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
}
