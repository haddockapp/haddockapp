export enum ConfigurationType {
  GITHUB_CLIENT_ID = "github_client_id",
  GITHUB_CLIENT_SECRET = "github_client_secret",
}

export type ConfigurationPayloadDto = {
  client_id: string;
  client_secret: string;
};

export type ConfigurationResponseDto = {
  key: ConfigurationType;
  value: string;
}[];
