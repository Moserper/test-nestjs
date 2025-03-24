import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceStatusDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleException } from 'src/utils/handle-exception';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createServiceDto: CreateServiceDto) {
    try {
      return this.prisma.service.create({
        data: {
          ...createServiceDto,
          status: 'OPEN',
        },
      });
    } catch (error) {
      handleException(error);
    }
  }

  async findAll() {
    try {
      return this.prisma.service.findMany({
        where: { softDelete: false },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      handleException(error);
    }
  }

  async findOne(id: string) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id, softDelete: false },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return service;
    } catch (error) {
      handleException(error);
    }
  }

  async remove(id: string) {
    try {
      const checkService = await this.prisma.service.findUnique({
        where: { id },
      });

      if (!checkService) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      if (checkService?.softDelete) {
        throw new BadRequestException(`Service with ID ${id} already deleted`);
      }

      const service = await this.prisma.service.update({
        where: { id },
        data: { softDelete: true },
      });

      return service;
    } catch (error) {
      handleException(error);
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateServiceStatusDto) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id, softDelete: false },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      const nextStatus: Record<'OPEN' | 'IN_PROGRESS', string[]> = {
        OPEN: ['IN_PROGRESS', 'DONE'],
        IN_PROGRESS: ['DONE'],
      };
      const currentStatus = service.status as keyof typeof nextStatus;

      const allowedStatuses = nextStatus[currentStatus] ?? [];

      if (!allowedStatuses.includes(updateStatusDto.status)) {
        throw new BadRequestException(
          `Cannot update status from ${service.status} to ${updateStatusDto.status}`,
        );
      }

      return this.prisma.service.update({
        where: { id },
        data: { status: updateStatusDto.status },
      });
    } catch (error) {
      handleException(error);
    }
  }
}
