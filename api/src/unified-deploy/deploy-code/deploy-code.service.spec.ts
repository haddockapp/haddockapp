import { Test, TestingModule } from '@nestjs/testing';
import { DeployCodeService } from './deploy-code.service';

describe('DeployCodeService', () => {
  let service: DeployCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployCodeService],
    }).compile();

    service = module.get<DeployCodeService>(DeployCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
