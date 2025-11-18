import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { Source } from '@prisma/client';
import { SourceService } from './source.service';
import { ZipSourceGuard } from './guard/zip-source.guard';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'node:fs';

@Controller('source')
export class SourceController {
  private readonly logger = new Logger(SourceController.name);

  constructor(private readonly source_service: SourceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSource(
    @Body() createSourceDto: CreateSourceDto,
  ): Promise<Source> {
    const source = await this.source_service.registerSource(createSourceDto);

    this.logger.log(`Source of type ${source.type} created`);
    return source;
  }

  @Post('/zip_upload/:id')
  @UseGuards(ZipSourceGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = '../uploads';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const sourceId = req.params.id;
          cb(null, `${sourceId}.zip`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/zip') {
          return cb(new Error('Only zip files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadZip(
    @Param('id') sourceId: string,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<{ file: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.log(`ZIP file uploaded: ${file.filename}`);

      return {
        file: file.filename,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to upload ZIP file',
      );
    }
  }
}
