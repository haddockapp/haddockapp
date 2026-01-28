import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost } from '@nestjs/common';

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter;
  let mockResponse: any;

  beforeEach(() => {
    filter = new PrismaClientExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const createHost = (): ArgumentsHost => {
      return {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as any;
    };

    it('should handle P2002 unique constraint error', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle P2025 record not found error', () => {
      const error = {
        code: 'P2025',
        message: 'Record not found',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle P2001 record not found error', () => {
      const error = {
        code: 'P2001',
        message: 'Record does not exist',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should handle P2003 foreign key constraint error', () => {
      const error = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should handle P2000 value too long error', () => {
      const error = {
        code: 'P2000',
        message: 'Value too long',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should handle P2004 constraint error', () => {
      const error = {
        code: 'P2004',
        message: 'Constraint failed',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should handle unknown Prisma errors by calling super', () => {
      const error = {
        code: 'P9999',
        message: 'Unknown error',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;
      const host = createHost();
      const superCatchSpy = jest
        .spyOn(
          Object.getPrototypeOf(PrismaClientExceptionFilter.prototype),
          'catch',
        )
        .mockImplementation(() => {});

      filter.catch(error, host);

      expect(superCatchSpy).toHaveBeenCalledWith(error, host);
      superCatchSpy.mockRestore();
    });

    it('should remove newlines from error message', () => {
      const error = {
        code: 'P2002',
        message: 'Error\nwith\nnewlines',
        clientVersion: '5.0.0',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      filter.catch(error, createHost());

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Errorwithnewlines',
        }),
      );
    });
  });
});
