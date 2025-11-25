export type SSOConfigurationInputDto = {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert?: string;
  enabled: boolean;
};

export type SSOConfigurationResponseDto = {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: boolean;
  enabled: boolean;
};

export type ToggleSSODto = {
  enabled: boolean;
};

export type SSOTestResponseDto = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
