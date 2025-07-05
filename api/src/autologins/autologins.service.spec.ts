import { Test, TestingModule } from '@nestjs/testing';
import { AutologinsService } from './autologins.service';

describe('AutologinsService', () => {
  let service: AutologinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutologinsService],
    }).compile();

    service = module.get<AutologinsService>(AutologinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
