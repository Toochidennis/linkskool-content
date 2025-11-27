export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email?: string;
  picture_ref?: string;
  role: 'user' | 'admin';
}
