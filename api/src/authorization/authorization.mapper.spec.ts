import { AuthorizationMapper } from './authorization.mapper';
import { AuthorizationEnum } from './types/authorization.enum';

describe('AuthorizationMapper', () => {
  let mapper: AuthorizationMapper;

  beforeEach(() => {
    mapper = new AuthorizationMapper();
  });

  describe('toAuthorizationObject', () => {
    it('should map authorization to AuthorizationDTO', () => {
      const authorization = {
        id: 'auth-1',
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
        value: { token: 'test-token' },
      } as any;

      const result = mapper.toAuthorizationObject(authorization);

      expect(result).toEqual({
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
        data: { token: 'test-token' },
      });
    });
  });

  describe('toResponse', () => {
    it('should map authorization to AuthorizationResponse', () => {
      const authorization = {
        id: 'auth-1',
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
        value: { token: 'test-token' },
      } as any;

      const result = mapper.toResponse(authorization);

      expect(result).toEqual({
        id: 'auth-1',
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
      });
    });
  });
});
