export type SSOConfigurationDto = {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
  enabled: boolean;
};
