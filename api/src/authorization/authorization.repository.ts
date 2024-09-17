import { Injectable } from "@nestjs/common";
import { Authorization } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthorizationRepository {
    constructor(private prismaService: PrismaService) { }

    async findByUserId(userId: string): Promise<Authorization | null> {
        return this.prismaService.authorization.findUnique({
            where: {
                userId,
            },
        });
    }

    async createAuthorization(accessToken: string, userId: string, type = 'oauth'): Promise<Authorization | null> {
        return this.prismaService.authorization.create({
            data: {
                type,
                value: accessToken,
                userId
            },
        });
    }
}
