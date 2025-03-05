import { Injectable } from '@nestjs/common';
import { parse } from 'yaml';
import Service from './model/Service';
import * as fs from 'fs';
import { ServiceUser } from './model/ServiceUser';
import { ServiceDeployment } from './model/ServiceDeployment';

@Injectable()
export class ComposeService {
  parseServices(yaml: string): Service[] {
    const composeObj: any = parse(yaml);
    const res: Service[] = [];

    if (!composeObj.services) {
      return [];
    }

    Object.entries(composeObj.services).forEach(([name, value]) => {
      const data = value as any;

      let user: ServiceUser = null;
      if (data.user) {
        user = {
          gid: data.user.split(':')[0],
          uid: data.user.split(':')[1],
        };
      }

      let deployment: ServiceDeployment = null;
      if (data?.deploy?.resources?.limits) {
        const memory = data.deploy.resources.limits.memory as string;
        deployment = {
          memory: memory.endsWith('M')
            ? Number(memory.slice(0, -1))
            : Number(memory.slice(0, -1)) * 1000,
          cpus: Number(data.deploy.resources.limits.cpus) * 100,
        };
      }

      let environment = {};
      if (data.environment) {
        if (Array.isArray(data.environment)) {
          for (const elem of data.environment) {
            const [key, value] = elem.split('=');
            environment[key] = value;
          }
        } else {
          environment = data.environment;
        }
      }

      res.push({
        name,
        image: data.image || 'Custom Dockerfile',
        ports: (data.ports || []).map((port) => port.split(':')[0]),
        networks: data.networks || [],
        depends_on: data.depends_on || [],
        environment,
        user,
        deployment,
      });
    });

    return res;
  }

  readComposeFile(projectId: string, composePath: string): string {
    const path = `${__dirname.split('/api')[0]}/workspaces/${projectId}`;

    if (!fs.existsSync(`${path}/${composePath}`)) {
      return '';
    }

    const composeContent = fs.readFileSync(`${path}/${composePath}`);
    if (!composeContent) {
      return '';
    }

    return composeContent.toString();
  }
}
