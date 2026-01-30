export interface SamlConfiguration {
  entryPoint: string;
  issuer: string;
  cert: string;
  callbackUrl: string;
  enabled?: boolean;
}

export interface SamlConfigurationPublic {
  entryPoint: string;
  issuer: string;
  cert: boolean;
  callbackUrl: string;
  enabled: boolean;
}
