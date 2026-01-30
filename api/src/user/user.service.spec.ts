import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { InvitationRepository } from '../invitation/invitation.repository';
import { UserRoleEnum } from './types/user-role.enum';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let invitationRepository: jest.Mocked<InvitationRepository>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: UserRoleEnum.MEMBER,
    isActive: true,
  };

  const mockAdminUser = {
    ...mockUser,
    id: 'admin-1',
    role: UserRoleEnum.ADMIN,
  };

  const mockInvitation = {
    id: 'invitation-1',
    email: 'invited@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            updatePassword: jest.fn(),
            updateActiveStatus: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: InvitationRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    invitationRepository = module.get(InvitationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toResponse', () => {
    it('should convert user to response DTO', () => {
      const result = service.toResponse(mockUser as any);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        isActive: mockUser.isActive,
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return all users and invitations', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-2' }];
      const invitations = [mockInvitation];

      userRepository.findAll.mockResolvedValue(users as any);
      invitationRepository.findAll.mockResolvedValue(invitations as any);

      const result = await service.findAll();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id', 'user-1');
      expect(result[1]).toHaveProperty('id', 'user-2');
      expect(result[2]).toHaveProperty('id', 'invitation-1');
      expect(result[2]).toHaveProperty('role', 'invited');
    });

    it('should return empty array when no users or invitations', async () => {
      userRepository.findAll.mockResolvedValue([]);
      invitationRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password successfully', async () => {
      const updateDto: UpdateUserPasswordDto = {
        password: 'new_password',
      };

      userRepository.findById.mockResolvedValue(mockUser as any);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      userRepository.updatePassword.mockResolvedValue({
        ...mockUser,
        password: 'new_hashed_password',
      } as any);

      const result = await service.updateUserPassword('user-1', updateDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 'salt');
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'new_hashed_password',
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const updateDto: UpdateUserPasswordDto = {
        password: 'new_password',
      };

      await expect(
        service.updateUserPassword('non-existent', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user has no password', async () => {
      const userWithoutPassword = {
        ...mockUser,
        password: null,
      };

      userRepository.findById.mockResolvedValue(userWithoutPassword as any);

      const updateDto: UpdateUserPasswordDto = {
        password: 'new_password',
      };

      await expect(
        service.updateUserPassword('user-1', updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('disableUser', () => {
    it('should disable user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      userRepository.updateActiveStatus.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);

      const result = await service.disableUser('user-1');

      expect(result.isActive).toBe(false);
      expect(userRepository.updateActiveStatus).toHaveBeenCalledWith(
        'user-1',
        false,
      );
    });

    it('should throw ForbiddenException if trying to disable admin', async () => {
      userRepository.findById.mockResolvedValue(mockAdminUser as any);

      await expect(service.disableUser('admin-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(userRepository.updateActiveStatus).not.toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      userRepository.updateActiveStatus.mockResolvedValue({
        ...inactiveUser,
        isActive: true,
      } as any);

      const result = await service.activateUser('user-1');

      expect(result.isActive).toBe(true);
      expect(userRepository.updateActiveStatus).toHaveBeenCalledWith(
        'user-1',
        true,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      userRepository.delete.mockResolvedValue(mockUser as any);

      const result = await service.deleteUser('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getUserDataFile', () => {
    it('should return user data as buffer', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUserDataFile('user-1');

      expect(result).toBeInstanceOf(Buffer);
      const data = JSON.parse(result.toString());
      expect(data.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        isActive: mockUser.isActive,
      });
      expect(data.user).not.toHaveProperty('password');
    });

    it('should format JSON with indentation', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUserDataFile('user-1');
      const content = result.toString();

      expect(content).toContain('\n');
      expect(content).toContain('  '); // Indentation
    });
  });
});
