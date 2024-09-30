import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { compile } from 'handlebars';
import { CaddyConfig } from './types/caddy-config.type';

@Injectable()
export class CaddyService {
  private readonly templates: {
    [key: string]: HandlebarsTemplateDelegate<any>
  } = {};

  private async getTemplate(template: string) {
    if (!this.templates[template]) {
      this.templates[template] = compile(
        readFileSync(`./src/caddy/template/${template}`).toString(),
      );
    }

    return this.templates[template];
  }

  private async saveCaddyfile(content: string, dest: string) {
    await writeFile(dest, content, {
      encoding: 'utf-8',
    });
  }

  private async reloadCaddy() {
    await new Promise<string>((resolve, reject) => {
      exec('caddy reload', {
        cwd: process.env.CADDY_ROOT_DIR,
      },
      (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
  }

  async generate(config: CaddyConfig) {
    const template = await this.getTemplate(config.template);
    const content = template(config.data);

    await this.saveCaddyfile(content, config.dest);
    await this.reloadCaddy();
  }
}
