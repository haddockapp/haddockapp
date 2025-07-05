export enum GithubAuthReason {
  CREATE_AUTHORIZATION = "create_authorization",
  LOGIN = "login",
}

export type AuthResponse = {
  accessToken: string;
};

export type GithubOAuthDto = {
  code: string;
};

export type SignupDto = {
  name: string;
  email: string;
  password: string;
};

export type LoginDto = Omit<SignupDto, "name">;
