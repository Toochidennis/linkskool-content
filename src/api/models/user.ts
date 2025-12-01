export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  password?: string;
  email?: string;
  picture_ref?: string;
  role: string;
  roleColor?: string
  permissions?: string
  lastActive?: string
  pictureRef?: string
}
