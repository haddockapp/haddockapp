import { Injectable } from "@nestjs/common";
import { Source } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateSourceRequest, PersistedSourceDto } from "./dto/source.dto";

@Injectable()
export class SourceRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async findById(id: string): Promise<PersistedSourceDto | null> {
        return this.prismaService.source.findUniqueOrThrow({
            where: { id },
            include: {
                authorization: true,
                project: true,
            }
        });
    }

    async createSource(source: CreateSourceRequest): Promise<Source | null> {
        return this.prismaService.source.create({
            data: source
        });
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.source.delete({
            where: { id },
        });
    }
}
