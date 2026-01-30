import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesRepository } from './workspaces.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let workspacesRepository: jest.Mocked<WorkspacesRepository>;

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: WorkspacesRepository,
          useValue: {
            findAllWorkspaces: jest.fn(),
            createWorkspace: jest.fn(),
            deleteWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    workspacesRepository = module.get(WorkspacesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all workspaces', async () => {
      const workspaces = [
        mockWorkspace,
        { ...mockWorkspace, id: 'workspace-2' },
      ];
      workspacesRepository.findAllWorkspaces.mockResolvedValue(
        workspaces as any,
      );

      const result = await service.findAll();

      expect(result).toEqual(workspaces);
      expect(workspacesRepository.findAllWorkspaces).toHaveBeenCalled();
    });

    it('should return empty array when no workspaces', async () => {
      workspacesRepository.findAllWorkspaces.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('createNewWorkspace', () => {
    it('should create workspace successfully', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'New Workspace',
      };

      workspacesRepository.createWorkspace.mockResolvedValue(
        mockWorkspace as any,
      );

      const result = await service.createNewWorkspace(createDto);

      expect(result).toEqual(mockWorkspace);
      expect(workspacesRepository.createWorkspace).toHaveBeenCalledWith(
        'New Workspace',
      );
    });

    it('should throw BadRequestException if workspace already exists', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Existing Workspace',
      };

      workspacesRepository.createWorkspace.mockRejectedValue(
        new Error('Unique constraint violation'),
      );

      await expect(service.createNewWorkspace(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace successfully', async () => {
      workspacesRepository.deleteWorkspace.mockResolvedValue();

      await service.deleteWorkspace('workspace-1');

      expect(workspacesRepository.deleteWorkspace).toHaveBeenCalledWith(
        'workspace-1',
      );
    });
  });
});
