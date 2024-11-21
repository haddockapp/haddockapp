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

    async findById(id: string): Promise<AuthorizationObject> {
        const authorization = await this.prismaService.authorization.findUniqueOrThrow({
            where: { id },
        });

        return this.mapper.toAuthorizationObject(authorization);
    }

    async createAuthorization(authorization: AuthorizationObject): Promise<Authorization | null> {
        return this.prismaService.authorization.create({
            data: {
                type: authorization.type,
                value: JSON.stringify(authorization.data),
            },
        });
    }
}
