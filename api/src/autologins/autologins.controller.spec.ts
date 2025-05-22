import { Test, TestingModule } from '@nestjs/testing';
import { AutologinsController } from './autologins.controller';
import { AutologinsService } from './autologins.service';

describe('AutologinsController', () => {
  let controller: AutologinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutologinsController],
      providers: [AutologinsService],
    }).compile();

    controller = module.get<AutologinsController>(AutologinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
