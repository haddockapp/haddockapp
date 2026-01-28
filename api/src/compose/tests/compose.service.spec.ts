import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { ComposeService } from '../compose.service';
import {
  composeConfig,
  customBuildComposeConfig,
  fullComposeConfig,
} from './mocks/compose.mock';
import Service from '../model/Service';

describe('ComposeService', () => {
  const projectId = 'test_project';
  const path = `${__dirname.split('/api')[0]}/workspaces`;

  let service: ComposeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComposeService],
    }).compile();

    service = module.get<ComposeService>(ComposeService);
  });

  describe('readComposeFile', () => {
    beforeAll(() => {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      if (!fs.existsSync(`${path}/${projectId}`)) {
        fs.mkdirSync(`${path}/${projectId}`);
      }

      fs.writeFileSync(`${path}/${projectId}/compose.yml`, composeConfig);
    });

    it('should read and return file content', () => {
      const content = service.readComposeFile(projectId, 'compose.yml');

      expect(content).not.toHaveLength(0);
    });

    it('should return empty content for wrong path', () => {
      const content = service.readComposeFile(projectId, 'wrong-compose.yml');

      expect(content).toHaveLength(0);
      expect(content).toEqual('');
    });

    afterAll(() => {
      fs.rmSync(`${path}/${projectId}`, { recursive: true, force: true });
    });
  });

  describe('parseServices', () => {
    it('should return parsed compose content', () => {
      const services: Service[] = service.parseServices(
        customBuildComposeConfig,
      );
      expect(services).toHaveLength(1);

      const s = services[0];
      expect(s.name).toEqual('fastapi');
      expect(s.image).toEqual('Custom Dockerfile');
      expect(s.ports).toHaveLength(1);
      expect(s.ports[0]).toEqual('3000');
      expect(s.networks).toHaveLength(0);
      expect(s.depends_on).toHaveLength(0);
      expect(s.environment).toHaveLength(0);
      expect(s.user).toBeNull();
      expect(s.deployment).toBeNull();
    });

    it('should return other services content', () => {
      const services: Service[] = service.parseServices(composeConfig);
      expect(services).toHaveLength(1);

      const s = services[0];
      expect(s.name).toEqual('postgres');
      expect(s.image).toEqual('postgres:13-alpine');
      expect(s.ports).toHaveLength(1);
      expect(s.ports[0]).toEqual('5432');
    });

    it('should return empty services array for wrong given data', () => {
      const services = service.parseServices('wrong data here');

      expect(services).toHaveLength(0);
    });

    it('should return a full compose config with all data fullfilled', () => {
      const services = service.parseServices(fullComposeConfig);
      expect(services).toHaveLength(2);

      const s1 = services[0];
      expect(s1.name).toEqual('backend');
      expect(s1.image).toEqual('node:16');
      expect(s1.ports).toHaveLength(1);
      expect(s1.ports[0]).toEqual('8080');
      expect(s1.networks).toHaveLength(1);
      expect(s1.networks[0]).toEqual('app-network');
      expect(s1.depends_on).toHaveLength(1);
      expect(s1.depends_on[0]).toEqual('database');
      expect(s1.environment).not.toBeNull();
      expect(s1.user).not.toBeNull();
      expect(s1.user.gid).toEqual('1000');
      expect(s1.user.uid).toEqual('1000');
      expect(s1.deployment).not.toBeNull();
      expect(s1.deployment.cpus).toEqual(50);
      expect(s1.deployment.memory).toEqual(512);
    });
  });
});
