import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from '@prisma/client';

@Injectable()
export class AuthorsService extends BaseService<
  Author,
  CreateAuthorDto,
  UpdateAuthorDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'Author');
  }

  async create(createAuthorDto: CreateAuthorDto) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.author.create({
          data: createAuthorDto,
          include: { books: true },
        }),
      'create',
    );
  }

  async findAll() {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.author.findMany({
          include: { books: true },
        }),
      'retrieve',
    );
  }

  async findOne(id: number) {
    return this.executeWithErrorHandling(
      async () => {
        const author = await this.prisma.author.findUnique({
          where: { id },
          include: { books: true },
        });

        if (!author) {
          throw new NotFoundException(`Author with ID ${id} not found`);
        }

        return author;
      },
      'find',
      id,
    );
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        return this.prisma.author.update({
          where: { id },
          data: updateAuthorDto,
          include: { books: true },
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
        return this.prisma.author.delete({
          where: { id },
        });
      },
      'delete',
      id,
    );
  }
}
