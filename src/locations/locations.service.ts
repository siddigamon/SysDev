import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  async findAll() {
    return this.prisma.location.findMany({
      include: {
        books: {
          include: { author: true },
        },
      },
    });
  }

  async findOne(id: number) {
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
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    await this.findOne(id);

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
      include: {
        books: {
          include: { author: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.location.delete({
      where: { id },
    });
  }
}
