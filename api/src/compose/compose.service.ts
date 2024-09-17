import { Injectable, NotFoundException } from "@nestjs/common";
import { parse } from 'yaml';
import Service from "./model/Service";
import * as fs from 'fs';

@Injectable()
export class ComposeService {

    parseServices(data: string): Service[] {
        const composeObj: any = parse(data);
        const res: Service[] = [];

        Object.entries(composeObj.services).forEach(([name, value]) => {
            const data = value as any;
            res.push({
                name,
                image: data.image || data.build,
                ports: data.ports,
            });
        });
        return res;
    }

    readComposeFile(projectId: string, composeName: string): string {
        const path = `${__dirname.split('/api')[0]}/workspaces/${projectId}`;
        const composeContent = fs.readFileSync(`${path}/${composeName}`);
        if (!composeContent) {
            throw new NotFoundException('No compose file found.');
        }

        return composeContent.toString();
    }
}
