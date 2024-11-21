import { Injectable } from "@nestjs/common";
import { Authorization } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthorizationObject } from "./types/authorization-object";
import { AuthorizationMapper } from "./authorization.mapper";

@Injectable()
export class AuthorizationRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly mapper: AuthorizationMapper
    ) { }

    async findById(id: string): Promise<Authorization> {
        return this.prismaService.authorization.findUniqueOrThrow({
            where: { id },
        });
    }

    async findAll(): Promise<Authorization[]> {
        return this.prismaService.authorization.findMany();
    }

    async createAuthorization(authorization: AuthorizationObject): Promise<Authorization | null> {
        return this.prismaService.authorization.create({
            data: {
                type: authorization.type,
                value: JSON.stringify(authorization.data),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.authorization.delete({
            where: { id },
        });
    }
}
