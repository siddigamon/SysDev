import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    try {
      return await this.prisma.author.create({
        data: createAuthorDto,
        include: { books: true },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Author with this information already exists',
          );
        }
      }
      throw new BadRequestException('Failed to create author');
    }
  }

  async findAll() {
    try {
      return await this.prisma.author.findMany({
        include: { books: true },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException('Failed to retrieve authors');
    }
  }

  async findOne(id: number) {
    try {
      const author = await this.prisma.author.findUnique({
        where: { id },
        include: { books: true },
      });

      if (!author) {
        throw new NotFoundException(`Author with ID ${id} not found`);
      }

      return author;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException(
        `Failed to find author with ID ${id}`,
      );
    }
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    try {
      await this.findOne(id);

      return await this.prisma.author.update({
        where: { id },
        data: updateAuthorDto,
        include: { books: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Author with this information already exists',
          );
        }
      }
      throw new BadRequestException(`Failed to update author with ID ${id}`);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return await this.prisma.author.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete author with associated books',
          );
        }
      }
      throw new BadRequestException(`Failed to delete author with ID ${id}`);
    }
  }
}
