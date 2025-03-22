export enum UserRole {
  Admin = "admin",
  Member = "member",
}

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type UpdateUserPasswordDto = {
  password: string;
};
