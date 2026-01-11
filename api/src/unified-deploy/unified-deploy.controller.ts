import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnifiedDeployDto } from './dto/unified-project.dto';
import { UnifiedDeployService } from './unified-deploy.service';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { randomUUID } from 'node:crypto';

@Controller('unified-deploy')
export class UnifiedDeployController {
  constructor(private readonly unifiedDeployService: UnifiedDeployService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('code', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = '../uploads';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const tmpId = randomUUID();
          cb(null, `${tmpId}.zip`);
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
  async unifiedDeploy(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() dto: UnifiedDeployDto,
  ): Promise<PersistedProjectDto> {
    return this.unifiedDeployService.deploy(file, dto);
  }
}
