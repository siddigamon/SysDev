import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    try {
      const { genreIds, ...bookData } = createBookDto;

      return await this.prisma.book.create({
        data: {
          ...bookData,
          publishedAt: new Date(createBookDto.publishedAt),
          reprintDate: createBookDto.reprintDate
            ? new Date(createBookDto.reprintDate)
            : undefined,
          // Create the many-to-many relationships for genres
          bookGenres: genreIds
            ? {
                create: genreIds.map((genreId) => ({ genreId })),
              }
            : undefined,
        },
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Book with this information already exists',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid author ID or genre ID provided',
          );
        }
      }
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll() {
    try {
      return await this.prisma.book.findMany({
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException('Failed to retrieve books');
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException(
        `Failed to find book with ID ${id}`,
      );
    }
  }

  async findByAuthor(authorId: number) {
    try {
      const authorExists = await this.prisma.author.findUnique({
        where: { id: authorId },
      });

      if (!authorExists) {
        throw new NotFoundException(`Author with ID ${authorId} not found`);
      }

      return await this.prisma.book.findMany({
        where: { authorId: authorId },
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
        orderBy: { publishedAt: 'asc' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException(
        `Failed to find books by author ${authorId}`,
      );
    }
  }

  async findByGenre(genreId: number) {
    try {
      await this.prisma.genre.findUniqueOrThrow({
        where: { id: genreId },
      });

      return await this.prisma.book.findMany({
        where: {
          bookGenres: {
            some: { genreId: genreId },
          },
        },
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
        orderBy: { title: 'asc' },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Genre with ID ${genreId} not found`);
        }
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException(
        `Failed to find books by genre ${genreId}`,
      );
    }
  }

  async findByLocation(locationId: number) {
    try {
      await this.prisma.location.findUniqueOrThrow({
        where: { id: locationId },
      });

      return await this.prisma.book.findMany({
        where: { locationId: locationId },
        include: {
          author: true,
          location: true,
          bookGenres: {
            include: { genre: true },
          },
        },
        orderBy: { title: 'asc' },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Location with ID ${locationId} not found`,
          );
        }
        throw new InternalServerErrorException('Database error occurred');
      }
      throw new InternalServerErrorException(
        `Failed to find books by location ${locationId}`,
      );
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    try {
      await this.findOne(id);

      const { genreIds, ...bookData } = updateBookDto;

      if (genreIds !== undefined) {
        await this.prisma.bookGenre.deleteMany({
          where: { bookId: id },
        });

        return await this.prisma.book.update({
          where: { id },
          data: {
            ...bookData,
            publishedAt: updateBookDto.publishedAt
              ? new Date(updateBookDto.publishedAt)
              : undefined,
            reprintDate: updateBookDto.reprintDate
              ? new Date(updateBookDto.reprintDate)
              : undefined,
            bookGenres:
              genreIds.length > 0
                ? {
                    create: genreIds.map((genreId) => ({ genreId })),
                  }
                : undefined,
          },
          include: {
            author: true,
            location: true,
            bookGenres: {
              include: { genre: true },
            },
          },
        });
      } else {
        return await this.prisma.book.update({
          where: { id },
          data: {
            ...bookData,
            publishedAt: updateBookDto.publishedAt
              ? new Date(updateBookDto.publishedAt)
              : undefined,
            reprintDate: updateBookDto.reprintDate
              ? new Date(updateBookDto.reprintDate)
              : undefined,
          },
          include: {
            author: true,
            location: true,
            bookGenres: {
              include: { genre: true },
            },
          },
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Book with this information already exists',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid author ID, location ID, or genre ID provided',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Book with ID ${id} not found`);
        }
      }
      throw new BadRequestException(`Failed to update book with ID ${id}`);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return await this.prisma.book.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Book with ID ${id} not found`);
        }
      }
      throw new BadRequestException(`Failed to delete book with ID ${id}`);
    }
  }
}
