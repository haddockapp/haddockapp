import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TemplatesMapper } from './templates.mapper';
import { Template } from './types/template.type';

@Injectable()
export class TemplatesService {
    constructor(private readonly mapper: TemplatesMapper) { }

    async listProjects() {
        const templates = await axios.get<Template[]>(process.env.TEMPLATES_INDEX_URL);
        return templates.data.map(template => this.mapper.toResponse(template));
    }
}
