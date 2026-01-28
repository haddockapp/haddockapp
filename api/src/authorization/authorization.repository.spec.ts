import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationRepository } from './authorization.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationDTO } from './dto/authorization.dto';
import { AuthorizationEnum } from './types/authorization.enum';

describe('AuthorizationRepository', () => {
  let repository: AuthorizationRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockAuthorization = {
    id: 'auth-1',
    name: 'Test Authorization',
    type: AuthorizationEnum.OAUTH,
    value: { token: 'test-token' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationRepository,
        {
          provide: PrismaService,
          useValue: {
            authorization: {
              findUniqueOrThrow: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<AuthorizationRepository>(AuthorizationRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an authorization by id', async () => {
      (
        prismaService.authorization.findUniqueOrThrow as jest.Mock
      ).mockResolvedValue(mockAuthorization);

      const result = await repository.findById('auth-1');

      expect(result).toEqual(mockAuthorization);
      expect(
        prismaService.authorization.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 'auth-1' },
      });
    });

    it('should throw error when authorization not found', async () => {
      const error = new Error('Authorization not found');
      (
        prismaService.authorization.findUniqueOrThrow as jest.Mock
      ).mockRejectedValue(error);

      await expect(repository.findById('non-existent')).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all authorizations', async () => {
      const authorizations = [mockAuthorization];
      (prismaService.authorization.findMany as jest.Mock).mockResolvedValue(
        authorizations,
      );

      const result = await repository.findAll();

      expect(result).toEqual(authorizations);
      expect(prismaService.authorization.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no authorizations exist', async () => {
      (prismaService.authorization.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('createAuthorization', () => {
    it('should create a new authorization', async () => {
      const authDto: AuthorizationDTO = {
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
        data: { token: 'test-token' },
      };

      (prismaService.authorization.create as jest.Mock).mockResolvedValue(
        mockAuthorization,
      );

      const result = await repository.createAuthorization(authDto);

      expect(result).toEqual(mockAuthorization);
      expect(prismaService.authorization.create).toHaveBeenCalledWith({
        data: {
          name: authDto.name,
          type: authDto.type,
          value: authDto.data,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete an authorization', async () => {
      (prismaService.authorization.delete as jest.Mock).mockResolvedValue(
        mockAuthorization,
      );

      await repository.delete('auth-1');

      expect(prismaService.authorization.delete).toHaveBeenCalledWith({
        where: { id: 'auth-1' },
      });
    });
  });
});
