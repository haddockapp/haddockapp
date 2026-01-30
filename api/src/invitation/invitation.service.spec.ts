import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationRepository } from './invitation.repository';
import { UserRepository } from '../user/user.repository';

describe('InvitationService', () => {
  let service: InvitationService;
  let invitationRepository: jest.Mocked<InvitationRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockInvitation = {
    id: 'invitation-1',
    email: 'invited@example.com',
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: InvitationRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    invitationRepository = module.get(InvitationRepository);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all invitations', async () => {
      const invitations = [
        mockInvitation,
        { ...mockInvitation, id: 'invitation-2' },
      ];
      invitationRepository.findAll.mockResolvedValue(invitations as any);

      const result = await service.findAll();

      expect(result).toEqual(invitations);
      expect(invitationRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find invitation by email', async () => {
      invitationRepository.findByEmail.mockResolvedValue(mockInvitation as any);

      const result = await service.findByEmail('invited@example.com');

      expect(result).toEqual(mockInvitation);
      expect(invitationRepository.findByEmail).toHaveBeenCalledWith(
        'invited@example.com',
      );
    });

    it('should return null if invitation not found', async () => {
      invitationRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createInvitation', () => {
    it('should create invitation successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      invitationRepository.create.mockResolvedValue(mockInvitation as any);

      const result = await service.createInvitation('invited@example.com');

      expect(result).toEqual(mockInvitation);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'invited@example.com',
      );
      expect(invitationRepository.create).toHaveBeenCalledWith(
        'invited@example.com',
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        service.createInvitation('user@example.com'),
      ).rejects.toThrow(BadRequestException);
      expect(invitationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteInvitationById', () => {
    it('should delete invitation by id', async () => {
      invitationRepository.delete.mockResolvedValue(mockInvitation as any);

      const result = await service.deleteInvitationById('invitation-1');

      expect(result).toEqual(mockInvitation);
      expect(invitationRepository.delete).toHaveBeenCalledWith('invitation-1');
    });
  });

  describe('userCanRegister', () => {
    it('should return invitation if invitation exists', () => {
      const result = service.userCanRegister(5, mockInvitation as any);

      expect(result).toBe(mockInvitation);
    });

    it('should return true if no users exist', () => {
      const result = service.userCanRegister(0, null);

      expect(result).toBe(true);
    });

    it('should return false if users exist and no invitation', () => {
      const result = service.userCanRegister(5, null);

      expect(result).toBe(false);
    });

    it('should return invitation even when users exist', () => {
      const result = service.userCanRegister(10, mockInvitation as any);

      expect(result).toBe(mockInvitation);
    });
  });

  describe('deleteInvitation', () => {
    it('should delete invitation if it exists', async () => {
      invitationRepository.delete.mockResolvedValue(mockInvitation as any);

      await service.deleteInvitation(mockInvitation as any);

      expect(invitationRepository.delete).toHaveBeenCalledWith('invitation-1');
    });

    it('should not throw error if invitation is null', async () => {
      await expect(service.deleteInvitation(null)).resolves.not.toThrow();
      expect(invitationRepository.delete).not.toHaveBeenCalled();
    });
  });
});
