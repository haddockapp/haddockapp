import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedDeployService } from './unified-deploy.service';

describe('UnifiedDeployService', () => {
  let service: UnifiedDeployService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnifiedDeployService],
    }).compile();

    service = module.get<UnifiedDeployService>(UnifiedDeployService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
