type CaddyfileConfig = {
  template: 'reverse-proxies.hbs';
  data: {
    data: {
      hostname: string;
      ip: string;
      port: number;
    }[];
    frontend?: {
      root: string;
      hostname: string;
      ip: string;
      port: number;
      https: boolean;
    };
  };
};

export type CaddyConfig = CaddyfileConfig & {
  dest: string;
};
