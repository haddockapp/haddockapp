import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { SourceFactory } from './source.factory';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SourceService {

    constructor(
        @InjectQueue('deploys') private deployQueue: Queue,
        private sourceFactory: SourceFactory,
        private prismaService: PrismaService,

    ) { }

    async registerSource(createSourceDto: CreateSourceDto) {
        const source = this.sourceFactory.createSource(createSourceDto);
        return this.prismaService.source.create({
            data: source
        });
    }

    async deploySource(sourceId: string) {
        const source = await this.prismaService.source.findUnique({
            where: {
                id: sourceId
            },
            include: {
                authorization: true,
                project: true
            }
        });
        if (!source) {
            throw new NotFoundException('Source not found');
        }

        await this.deployQueue.add('deploy', source);
    }
}
