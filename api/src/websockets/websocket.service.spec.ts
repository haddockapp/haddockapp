import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketService } from './websocket.service';
import { ProjectRepository } from '../project/project.repository';
import { Socket } from 'socket.io';
import { ProjectEventDto, ServiceEnum } from './dto/project-event.dto';
import { EventScope, EventType } from './dto/websocket-event.dto';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('WebSocketService', () => {
  let service: WebSocketService;
  let projectRepository: jest.Mocked<ProjectRepository>;

  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  } as any as Socket;

  const mockProject = {
    id: 'project-1',
    vm: {
      ip: '192.168.1.1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketService,
        {
          provide: ProjectRepository,
          useValue: {
            findProjectById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebSocketService>(WebSocketService);
    projectRepository = module.get(ProjectRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addClient', () => {
    it('should add client to clients map', () => {
      service.addClient('user-1', mockSocket);

      expect(service).toBeDefined();
    });
  });

  describe('removeClient', () => {
    it('should remove client from clients map', () => {
      service.addClient('user-1', mockSocket);
      service.removeClient(mockSocket);

      expect(service).toBeDefined();
    });
  });

  describe('notifyUser', () => {
    it('should notify specific user', () => {
      service.addClient('user-1', mockSocket);
      const message = { type: 'test' };

      service.notifyUser('user-1', message);

      expect(mockSocket.emit).toHaveBeenCalledWith('message', message);
    });

    it('should not notify if user not found', () => {
      const message = { type: 'test' };

      service.notifyUser('non-existent', message);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('notifyAll', () => {
    it('should notify all connected clients', () => {
      const socket1 = { emit: jest.fn() } as any;
      const socket2 = { emit: jest.fn() } as any;

      service.addClient('user-1', socket1);
      service.addClient('user-2', socket2);

      const message = {
        scope: EventScope.PROJECT,
        event: EventType.STATUS_CHANGE,
        target: 'project-1',
        data: { status: 'running' },
      };
      service.notifyAll(message);

      expect(socket1.emit).toHaveBeenCalledWith('message', message);
      expect(socket2.emit).toHaveBeenCalledWith('message', message);
    });
  });

  describe('createProject', () => {
    it('should create project handler', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);
      (io as jest.Mock).mockReturnValue({
        on: jest.fn(),
        emit: jest.fn(),
        close: jest.fn(),
      });

      await service.createProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
    });

    it('should not create duplicate project handlers', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);
      (io as jest.Mock).mockReturnValue({
        on: jest.fn(),
        emit: jest.fn(),
        close: jest.fn(),
      });

      await service.createProject('project-1');
      await service.createProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeProject', () => {
    it('should remove project and close websocket', async () => {
      const mockWs = {
        on: jest.fn(),
        emit: jest.fn(),
        close: jest.fn(),
      };
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);
      (io as jest.Mock).mockReturnValue(mockWs);

      await service.createProject('project-1');
      service.removeProject('project-1');

      expect(mockWs.close).toHaveBeenCalled();
    });
  });
});
