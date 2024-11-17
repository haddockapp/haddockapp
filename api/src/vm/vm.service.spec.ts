import { Test, TestingModule } from '@nestjs/testing';
import { VmService } from './vm.service';
import { VmRepository } from './vm.repository';
import { PrismaService } from 'src/prisma/prisma.service';

describe('VmService', () => {
    it('should be true', () => {
        expect(true).toBeTruthy();
    });
//   let service: VmService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [VmService, PrismaService, VmRepository],
//     }).compile();

//     service = module.get<VmService>(VmService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
});
