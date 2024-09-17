import { Test, TestingModule } from '@nestjs/testing';
import { CaddyController } from './caddy.controller';

describe('CaddyController', () => {
  let controller: CaddyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaddyController],
    }).compile();

    controller = module.get<CaddyController>(CaddyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
