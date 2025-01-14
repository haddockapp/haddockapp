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
