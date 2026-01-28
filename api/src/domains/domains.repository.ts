import { ConflictException, Injectable } from '@nestjs/common';
import { Domain } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';

@Injectable()
export class DomainRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createDomain(
    data: CreateDomainDto,
    challenge: string,
  ): Promise<Domain> {
    try {
      return await this.prismaService.domain.create({
        data: {
          domain: data.domain,
          main: data.main,
          challenge,
          https: data.https,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Domain already exists');
      }
    }
  }

  async linkDomain(id: string, isLinked: boolean): Promise<Domain> {
    return this.prismaService.domain.update({
      where: {
        id,
      },
      data: {
        linked: isLinked,
      },
    });
  }

  async findAllDomains(): Promise<Domain[]> {
    return this.prismaService.domain.findMany();
  }

  async findDomainById(id: string): Promise<Domain> {
    return this.prismaService.domain.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async findDomainByName(domainName: string): Promise<Domain | null> {
    return this.prismaService.domain.findFirst({
      where: {
        domain: domainName,
      },
    });
  }

  async deleteDomain(id: string): Promise<Domain> {
    return this.prismaService.domain.delete({
      where: {
        id,
      },
    });
  }

  async hasMainDomain(): Promise<boolean> {
    return this.prismaService.domain
      .count({
        where: {
          main: true,
        },
      })
      .then((count) => count > 0);
  }

  async getMainDomain(): Promise<Domain | null> {
    return this.prismaService.domain.findFirst({
      where: {
        main: true,
      },
    });
  }
}
