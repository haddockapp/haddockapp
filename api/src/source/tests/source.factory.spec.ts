// sourceFactory.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CreateGithubSourceDto } from '../dto/create-source.dto';
import { SourceDto } from '../dto/source.dto';
import { SourceFactory } from '../source.factory';
import { generateCreateGithubSourceDto, generateSourceDto } from './mocks/sources.mock';

describe('SourceFactory', () => {
  let factory: SourceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceFactory],
    }).compile();

    factory = module.get<SourceFactory>(SourceFactory);
  });

  describe('createGithubSource', () => {
    it('should create a SourceDto for GitHub source type', () => {
      const createGithubSourceDto: CreateGithubSourceDto = generateCreateGithubSourceDto();
      const expectedSourceDto: SourceDto = generateSourceDto(createGithubSourceDto);

      const result = factory['createGithubSource'](createGithubSourceDto);

      expect(result).toEqual(expectedSourceDto);
    });
  });

  describe('createSource', () => {
    it('should create a SourceDto when the type is GitHub', () => {
      const createGithubSourceDto: CreateGithubSourceDto = generateCreateGithubSourceDto();
      const expectedSourceDto: SourceDto = generateSourceDto(createGithubSourceDto);

      const result = factory.createSource(createGithubSourceDto);

      expect(result).toEqual(expectedSourceDto);
    });

    it('should throw an error for an invalid source type', () => {
      const invalidSourceDto = { ...generateCreateGithubSourceDto(), type: 'invalid' as 'github' };

      expect(() => factory.createSource(invalidSourceDto)).toThrow('Invalid source type');
    });
  });
});
