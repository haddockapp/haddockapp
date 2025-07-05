import { Injectable } from "@nestjs/common";
import { Authorization } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthorizationDTO } from "./dto/authorization.dto";

@Injectable()
export class AuthorizationRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async findById(id: string): Promise<Authorization> {
        return this.prismaService.authorization.findUniqueOrThrow({
            where: { id },
        });
    }

    async findAll(): Promise<Authorization[]> {
        return this.prismaService.authorization.findMany();
    }

    async createAuthorization(authorization: AuthorizationDTO): Promise<Authorization | null> {
        return this.prismaService.authorization.create({
            data: {
                name: authorization.name,
                type: authorization.type,
                value: authorization.data,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.authorization.delete({
            where: { id },
        });
    }
}
