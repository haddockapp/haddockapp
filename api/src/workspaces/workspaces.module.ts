import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspacesController } from 'src/workspaces/workspaces.controller';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspacesRepository],
})
export class WorkspacesModule {}
