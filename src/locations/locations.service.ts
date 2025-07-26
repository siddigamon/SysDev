import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ChangeLocationStatusDto } from '../common/dto/status.dto';
import { Location, LocationStatus } from '@prisma/client';

@Injectable()
export class LocationsService extends BaseService<
  Location,
  CreateLocationDto,
  UpdateLocationDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'Location');
  }

  async create(createLocationDto: CreateLocationDto) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.location.create({
          data: createLocationDto,
          include: {
            books: {
              where: this.getActiveBookFilter(),
              include: { author: true },
            },
          },
        }),
      'create',
    );
  }

  async findAll(includeInactive = false) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.location.findMany({
          where: includeInactive ? {} : this.getActiveLocationFilter(),
          include: {
            books: {
              where: this.getActiveBookFilter(),
              include: { author: true },
            },
          },
          orderBy: [{ floor: 'asc' }, { section: 'asc' }, { name: 'asc' }],
        }),
      'retrieve',
    );
  }

  async findByStatus(status: LocationStatus) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.location.findMany({
          where: { status },
          include: {
            books: {
              where: this.getActiveBookFilter(),
              include: { author: true },
            },
          },
          orderBy: [{ floor: 'asc' }, { section: 'asc' }, { name: 'asc' }],
        }),
      'find by status',
    );
  }

  async findOne(id: number) {
    return this.executeWithErrorHandling(
      async () => {
        const location = await this.prisma.location.findUnique({
          where: { id },
          include: {
            books: {
              include: {
                author: true,
                bookGenres: {
                  include: { genre: true },
                },
              },
            },
          },
        });

        if (!location) {
          throw new NotFoundException(`Location with ID ${id} not found`);
        }

        return location;
      },
      'find',
      id,
    );
  }

  async changeStatus(id: number, changeStatusDto: ChangeLocationStatusDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        return this.prisma.location.update({
          where: { id },
          data: {
            status: changeStatusDto.status,
          },
          include: {
            books: {
              where: this.getActiveBookFilter(),
              include: { author: true },
            },
          },
        });
      },
      'change status',
      id,
    );
  }

  async deactivate(id: number) {
    return this.changeStatus(id, { status: LocationStatus.INACTIVE });
  }

  async activate(id: number) {
    return this.changeStatus(id, { status: LocationStatus.ACTIVE });
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        return this.prisma.location.update({
          where: { id },
          data: updateLocationDto,
          include: {
            books: {
              where: this.getActiveBookFilter(),
              include: { author: true },
            },
          },
        });
      },
      'update',
      id,
    );
  }

  async remove(id: number) {
    return this.deactivate(id); // Soft delete by deactivating
  }
}
