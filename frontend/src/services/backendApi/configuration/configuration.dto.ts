export enum ConfigurationType {
  GITHUB_CLIENT_ID = "github_client_id",
  GITHUB_CLIENT_SECRET = "github_client_secret",
  SAML_ENTRY_POINT = "saml_entry_point",
  SAML_ISSUER = "saml_issuer",
  SAML_CALLBACK_URL = "saml_callback_url",
}

export type ConfigurationPayloadDto = {
  client_id: string;
  client_secret: string;
};

export type ConfigurationResponseDto = {
  key: ConfigurationType;
  value: string;
}[];
