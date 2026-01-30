import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { InvitationRepository } from '../invitation/invitation.repository';
import { AutologinsService } from '../autologins/autologins.service';
import { SignupDto } from './dto/Signup.dto';
import { UserRoleEnum } from '../user/types/user-role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: jest.Mocked<PrismaService>;
  let userRepository: jest.Mocked<UserRepository>;
  let invitationRepository: jest.Mocked<InvitationRepository>;
  let autologinService: jest.Mocked<AutologinsService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: UserRoleEnum.MEMBER,
    isActive: true,
  };

  const mockInvitation = {
    id: 'invitation-1',
    email: 'invited@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn().mockResolvedValue(0),
              create: jest.fn().mockResolvedValue(mockUser),
            },
          },
        },
        {
          provide: 'AutologinsService',
          useValue: {
            generateToken: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: InvitationRepository,
          useValue: {
            findByEmail: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AutologinsService,
          useValue: {
            generateToken: jest.fn().mockResolvedValue('autologin-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
    userRepository = module.get(UserRepository);
    invitationRepository = module.get(InvitationRepository);
    autologinService = module.get(AutologinsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJwt', () => {
    it('should generate JWT token for user', () => {
      const token = 'jwt_token';
      jwtService.sign.mockReturnValue(token);

      const result = service.generateJwt(mockUser as any);

      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed_password',
      );
    });

    it('should return null if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if user has no password', async () => {
      const userWithoutPassword = {
        ...mockUser,
        password: null,
      };

      userRepository.findByEmail.mockResolvedValue(userWithoutPassword as any);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong_password',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password',
      );
    });
  });

  describe('signup', () => {
    it('should create first user as admin', async () => {
      const signupDto: SignupDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(0);
      invitationRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: 'admin@example.com',
        role: UserRoleEnum.ADMIN,
      } as any);

      const result = await service.signup(signupDto);

      expect(result.role).toBe(UserRoleEnum.ADMIN);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: signupDto.name,
            email: signupDto.email,
            password: 'hashed_password',
            role: UserRoleEnum.ADMIN,
          }),
        }),
      );
    });

    it('should create user as member when users exist', async () => {
      const signupDto: SignupDto = {
        email: 'member@example.com',
        name: 'Member User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(1);
      invitationRepository.findByEmail.mockResolvedValue(mockInvitation as any);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: 'member@example.com',
        role: UserRoleEnum.MEMBER,
      } as any);
      invitationRepository.delete.mockResolvedValue(mockInvitation as any);

      const result = await service.signup(signupDto);

      expect(result.role).toBe(UserRoleEnum.MEMBER);
      expect(invitationRepository.delete).toHaveBeenCalledWith('invitation-1');
    });

    it('should throw ForbiddenException if no invitation and users exist', async () => {
      const signupDto: SignupDto = {
        email: 'user@example.com',
        name: 'User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(1);
      invitationRepository.findByEmail.mockResolvedValue(null);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash password before creating user', async () => {
      const signupDto: SignupDto = {
        email: 'user@example.com',
        name: 'User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(0);
      invitationRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockResolvedValue(
        mockUser as any,
      );

      await service.signup(signupDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should delete invitation after signup when invitation exists', async () => {
      const signupDto: SignupDto = {
        email: 'invited@example.com',
        name: 'Invited User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(1);
      invitationRepository.findByEmail.mockResolvedValue(mockInvitation as any);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockResolvedValue(
        mockUser as any,
      );
      invitationRepository.delete.mockResolvedValue(mockInvitation as any);

      await service.signup(signupDto);

      expect(invitationRepository.delete).toHaveBeenCalledWith('invitation-1');
    });

    it('should not delete invitation if it is the first user', async () => {
      const signupDto: SignupDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
      };

      (prismaService.user.count as jest.Mock).mockResolvedValue(0);
      invitationRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prismaService.user.create as jest.Mock).mockResolvedValue(
        mockUser as any,
      );

      await service.signup(signupDto);

      expect(invitationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('generateAutologinLink', () => {
    it('should generate autologin link with token', async () => {
      const userId = 'user-1';
      const token = 'autologin_token';
      process.env.FRONTEND_URL = 'http://localhost:5173';

      autologinService.generateToken.mockResolvedValue(token);

      const result = await service.generateAutologinLink(userId);

      expect(result).toBe(`http://localhost:5173/autologin?token=${token}`);
      expect(autologinService.generateToken).toHaveBeenCalledWith(userId);
    });

    it('should use default frontend URL if not set', async () => {
      const userId = 'user-1';
      const token = 'autologin_token';
      delete process.env.FRONTEND_URL;

      autologinService.generateToken.mockResolvedValue(token);

      const result = await service.generateAutologinLink(userId);

      expect(result).toBe(`http://localhost:5173/autologin?token=${token}`);
    });
  });
});
