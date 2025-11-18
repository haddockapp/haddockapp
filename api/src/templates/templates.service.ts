import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TemplatesMapper } from './templates.mapper';
import { Template } from './types/template.type';
import { generateSecret } from './utils/generate-secret';

@Injectable()
export class TemplatesService {
    constructor(private readonly mapper: TemplatesMapper) { }

    async listTemplates() {
        const templates = await axios.get<Template[]>(process.env.TEMPLATES_INDEX_URL);
        return templates.data.map(template => this.mapper.toResponse(template));
    }

    private async getTemplateById(id: string): Promise<Template | null> {
        const templates = await axios.get<Template[]>(process.env.TEMPLATES_INDEX_URL);
        const template = templates.data.find(template => template.id === id);
        return template || null;
    }

    private async getTemplateVersion(templateId: string, versionId: string) {
        const template = await this.getTemplateById(templateId);
        if (!template) {
            return null;
        }
        const version = template.versions.find(v => v.id === versionId);
        return version || null;
    }

    async buildTemplateEnvironment(templateId: string, versionId: string, env: Record<string, string>): Promise<Record<string, string>> {
        const version = await this.getTemplateVersion(templateId, versionId);
        if (!version) {
            throw new Error('Template version not found');
        }

        const builtEnv: Record<string, string> = {};
        for (const variable of version.env) {
            if (variable.policy === 'input') {
                if (env[variable.key] === undefined) {
                    throw new Error(`Missing required environment variable: ${variable.key}`);
                }
                builtEnv[variable.key] = env[variable.key];
            } else if (variable.policy === 'generated') {
                builtEnv[variable.key] = generateSecret(16, 32);
            }
        }
        return builtEnv;
    }
}
