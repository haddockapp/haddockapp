import { Injectable } from '@nestjs/common';
import { Prisma, Vm } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VmRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async getVm(
        vmWhereUniqueInput: Prisma.VmWhereUniqueInput,
    ): Promise<Vm | null> {
        return this.prismaService.vm.findUnique({
            where: vmWhereUniqueInput,
        });
    }

    async getVmAndProject(
        vmWhereUniqueInput: Prisma.VmWhereUniqueInput,
    ): Promise<Prisma.VmGetPayload<{
        include: {
            project: true;
        };
    }> | null> {
        return this.prismaService.vm.findUnique({
            where: vmWhereUniqueInput,
            include: {
                project: true,
            },
        });
    }

    async getVms(
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.VmWhereUniqueInput;
            where?: Prisma.VmWhereInput;
            orderBy?: Prisma.VmOrderByWithRelationInput;
        }): Promise<Vm[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prismaService.vm.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async deleteVm(
        where: Prisma.VmWhereUniqueInput): Promise<Vm> {
        return this.prismaService.vm.delete({
            where,
        });
    }

    async updateVm(
        params: {
            where: Prisma.VmWhereUniqueInput;
            data: Partial<Vm>;
        }): Promise<Vm> {
        const { where, data } = params;

        const updateData: Prisma.VmUpdateInput = {
            ip: data.ip,
            status: data.status,
            memory: data.memory,
            disk: data.disk,
            cpus: data.cpus,
            provider: data.provider,
        };

        return this.prismaService.vm.update({
            data: updateData,
            where,
        });
    }
}
