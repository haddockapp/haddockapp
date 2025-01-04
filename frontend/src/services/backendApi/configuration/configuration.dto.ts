export type ConfigurationPayloadDto = {
  client_id: string;
  client_secret: string;
};

export type ConfigurationResponseDto = {
  key: string;
  value: string;
}[];
