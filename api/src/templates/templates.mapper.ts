import {
    Injectable
} from '@nestjs/common';
import { TemplateResponse } from './types/template.response';
import { Template } from './types/template.type';

@Injectable()
export class TemplatesMapper {
    public toResponse(template: Template): TemplateResponse {
        return {
            id: template.id,
            name: template.name,
            versions: template.versions.map(version => ({
                id: version.id,
                label: version.label,
                variables: version.env.filter(env => env.policy === "input").map(env => ({
                    key: env.key,
                    label: env.label,
                    type: env.type
                }))
            })),
            description: template.description,
            icon: template.icon
        };
    }
}
