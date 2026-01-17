import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedDeployController } from './unified-deploy.controller';

describe('UnifiedDeployController', () => {
  let controller: UnifiedDeployController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnifiedDeployController],
    }).compile();

    controller = module.get<UnifiedDeployController>(UnifiedDeployController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
