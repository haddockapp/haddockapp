import { Test, TestingModule } from '@nestjs/testing';
import { InvitationRepository } from './invitation.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('InvitationRepository', () => {
  let repository: InvitationRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockInvitation = {
    id: 'invitation-1',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationRepository,
        {
          provide: PrismaService,
          useValue: {
            invitation: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<InvitationRepository>(InvitationRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all invitations', async () => {
      const invitations = [mockInvitation];
      (prismaService.invitation.findMany as jest.Mock).mockResolvedValue(
        invitations,
      );

      const result = await repository.findAll();

      expect(result).toEqual(invitations);
      expect(prismaService.invitation.findMany).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return an invitation by email', async () => {
      (prismaService.invitation.findUnique as jest.Mock).mockResolvedValue(
        mockInvitation,
      );

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockInvitation);
      expect(prismaService.invitation.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when invitation not found', async () => {
      (prismaService.invitation.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return an invitation by id', async () => {
      (prismaService.invitation.findUnique as jest.Mock).mockResolvedValue(
        mockInvitation,
      );

      const result = await repository.findById('invitation-1');

      expect(result).toEqual(mockInvitation);
      expect(prismaService.invitation.findUnique).toHaveBeenCalledWith({
        where: { id: 'invitation-1' },
      });
    });
  });

  describe('create', () => {
    it('should create a new invitation', async () => {
      (prismaService.invitation.create as jest.Mock).mockResolvedValue(
        mockInvitation,
      );

      const result = await repository.create('test@example.com');

      expect(result).toEqual(mockInvitation);
      expect(prismaService.invitation.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com' },
      });
    });
  });

  describe('delete', () => {
    it('should delete an invitation', async () => {
      (prismaService.invitation.delete as jest.Mock).mockResolvedValue(
        mockInvitation,
      );

      const result = await repository.delete('invitation-1');

      expect(result).toEqual(mockInvitation);
      expect(prismaService.invitation.delete).toHaveBeenCalledWith({
        where: { id: 'invitation-1' },
      });
    });
  });
});
