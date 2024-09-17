import { Test, TestingModule } from '@nestjs/testing';
import { CaddyService } from './caddy.service';

describe('CaddyService', () => {
  let service: CaddyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaddyService],
    }).compile();

    service = module.get<CaddyService>(CaddyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
