import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from '@prisma/client';

@Injectable()
export class GenresService extends BaseService<
  Genre,
  CreateGenreDto,
  UpdateGenreDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'Genre');
  }

  async create(createGenreDto: CreateGenreDto) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.genre.create({
          data: createGenreDto,
          include: {
            bookGenres: {
              include: { book: true },
            },
          },
        }),
      'create',
    );
  }

  async findAll() {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.genre.findMany({
          include: {
            bookGenres: {
              include: { book: true },
            },
          },
        }),
      'retrieve',
    );
  }

  async findOne(id: number) {
    return this.executeWithErrorHandling(
      async () => {
        const genre = await this.prisma.genre.findUnique({
          where: { id },
          include: {
            bookGenres: {
              include: {
                book: {
                  include: { author: true },
                },
              },
            },
          },
        });

        if (!genre) {
          throw new NotFoundException(`Genre with ID ${id} not found`);
        }

        return genre;
      },
      'find',
      id,
    );
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        return this.prisma.genre.update({
          where: { id },
          data: updateGenreDto,
          include: {
            bookGenres: {
              include: { book: true },
            },
          },
        });
      },
      'update',
      id,
    );
  }

  async remove(id: number) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);

        const associationCount = await this.prisma.bookGenre.count({
          where: { genreId: id },
        });

        if (associationCount > 0) {
          throw new ConflictException(
            `Cannot delete genre with ${associationCount} book associations. Remove all book-genre relationships first.`,
          );
        }

        return this.prisma.genre.delete({ where: { id } });
      },
      'delete',
      id,
    );
  }
}
