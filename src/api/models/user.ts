export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  password?: string;
  email?: string;
  picture_ref?: string;
  role: string;
  status?: 0 | 1;
  roleColor?: string
  permissions?: string
  lastActive?: string
  pictureRef?: string
}
