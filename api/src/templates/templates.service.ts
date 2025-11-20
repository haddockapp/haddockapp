import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TemplatesMapper } from './templates.mapper';
import { Template, Version } from './types/template.type';
import { generateSecret } from './utils/generate-secret';
import { TemplateResponse } from './types/template.response';
import { EnvironmentVar } from 'src/project/dto/environmentVar';

@Injectable()
export class TemplatesService {
  constructor(private readonly mapper: TemplatesMapper) {}

  async listTemplates(): Promise<TemplateResponse[]> {
    const templates = await axios.get<Template[]>(
      process.env.TEMPLATES_INDEX_URL,
    );
    return templates.data.map((template) => this.mapper.toResponse(template));
  }

  private async getTemplateById(id: string): Promise<Template | null> {
    const templates = await axios.get<Template[]>(
      process.env.TEMPLATES_INDEX_URL,
    );
    const template = templates.data.find((template) => template.id === id);
    return template || null;
  }

  async getTemplateVersion(
    templateId: string,
    versionId: string,
  ): Promise<Version | null> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      return null;
    }
    const version = template.versions.find((v) => v.id === versionId);
    return version || null;
  }

  async buildTemplateEnvironment(
    templateId: string,
    versionId: string,
    variables: Record<string, string>,
  ): Promise<EnvironmentVar[]> {
    const version = await this.getTemplateVersion(templateId, versionId);
    if (!version) {
      throw new Error('Template version not found');
    }

    const builtEnv: EnvironmentVar[] = [];
    for (const variable of version.env) {
      if (variable.policy === 'input') {
        if (variables[variable.key] === undefined) {
          throw new Error(
            `Missing required environment variable: ${variable.key}`,
          );
        }
        builtEnv.push({
          key: variable.key,
          value: variables[variable.key],
          isSecret: variable.type === 'secret',
        });
      } else if (variable.policy === 'generated') {
        builtEnv.push({
          key: variable.key,
          value: generateSecret(16, 32),
          isSecret: variable.type === 'secret',
        });
      }
    }
    return builtEnv;
  }
}
