import { Injectable } from "@nestjs/common";
import { Authorization, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserRepository {
    constructor(private prismaService: PrismaService) { }

    async findById(id: string): Promise<User & { authorization: Authorization } | null> {
        return this.prismaService.user.findUnique({
            where: {
                id,
            },
            include: {
                authorization: true,
            },
        });
    }

    async findByEmail(email: string): Promise<User & { authorization: Authorization } | null> {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: {
                authorization: true,
            },
        });
    }

    async createUser(email: string, name: string): Promise<User | null> {
        return this.prismaService.user.create({
            data: {
                email,
                name,
            },
        });
    }
}
