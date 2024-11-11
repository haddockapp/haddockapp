import { Injectable } from '@nestjs/common';
import { FrontendConfig } from './types/frontend-config.type';
import { promises as fs } from 'fs';

@Injectable()
export class FrontendService {
  async getFrontendConfig(): Promise<FrontendConfig> {
    const fileContent = await fs.readFile(process.env.FRONTEND_CONFIG);
    return JSON.parse(fileContent.toString());
  }

  async setFrontendConfig(config: FrontendConfig): Promise<void> {
    await fs.writeFile(process.env.FRONTEND_CONFIG, JSON.stringify(config));
  }

  async setFrontendConfigValue(key: keyof FrontendConfig, value: FrontendConfig[keyof FrontendConfig]): Promise<void> {
    const config = await this.getFrontendConfig();
    config[key] = value;
    await this.setFrontendConfig(config);
  }

  async getFrontendConfigValue(key: keyof FrontendConfig): Promise<FrontendConfig[keyof FrontendConfig]> {
    const config = await this.getFrontendConfig();
    return config[key];
  }
}
