import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService extends BaseService<
  Book,
  CreateBookDto,
  UpdateBookDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'Book');
  }

  async create(createBookDto: CreateBookDto) {
    return this.executeWithErrorHandling(() => {
      const { genreIds, ...bookData } = createBookDto;
      return this.prisma.book.create({
        data: {
          ...bookData,
          publishedAt: new Date(createBookDto.publishedAt),
          reprintDate: createBookDto.reprintDate
            ? new Date(createBookDto.reprintDate)
            : undefined,
          bookGenres: genreIds
            ? {
                create: genreIds.map((genreId) => ({ genreId })),
              }
            : undefined,
        },
        include: {
          author: true,
          location: true,
          bookGenres: { include: { genre: true } },
        },
      });
    }, 'create');
  }

  async findAll() {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.book.findMany({
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
        }),
      'retrieve',
    );
  }

  async findOne(id: number) {
    return this.executeWithErrorHandling(
      async () => {
        const book = await this.prisma.book.findUnique({
          where: { id },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
        });

        if (!book) {
          throw new NotFoundException(`Book with ID ${id} not found`);
        }

        return book;
      },
      'find',
      id,
    );
  }

  async findByAuthor(authorId: number) {
    return this.executeWithErrorHandling(
      async () => {
        const authorExists = await this.prisma.author.findUnique({
          where: { id: authorId },
        });

        if (!authorExists) {
          throw new NotFoundException(`Author with ID ${authorId} not found`);
        }

        return this.prisma.book.findMany({
          where: { authorId },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
          orderBy: { publishedAt: 'asc' },
        });
      },
      'find books by author',
      authorId,
    );
  }

  async findByGenre(genreId: number) {
    return this.executeWithErrorHandling(
      async () => {
        const genreExists = await this.prisma.genre.findUnique({
          where: { id: genreId },
        });

        if (!genreExists) {
          throw new NotFoundException(`Genre with ID ${genreId} not found`);
        }

        return this.prisma.book.findMany({
          where: {
            bookGenres: { some: { genreId } },
          },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
          orderBy: { title: 'asc' },
        });
      },
      'find books by genre',
      genreId,
    );
  }

  async findByLocation(locationId: number) {
    return this.executeWithErrorHandling(
      async () => {
        const locationExists = await this.prisma.location.findUnique({
          where: { id: locationId },
        });

        if (!locationExists) {
          throw new NotFoundException(
            `Location with ID ${locationId} not found`,
          );
        }

        return this.prisma.book.findMany({
          where: { locationId },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
          orderBy: { title: 'asc' },
        });
      },
      'find books by location',
      locationId,
    );
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        const { genreIds, ...bookData } = updateBookDto;

        if (genreIds !== undefined) {
          await this.prisma.bookGenre.deleteMany({
            where: { bookId: id },
          });

          return this.prisma.book.update({
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
                  ? { create: genreIds.map((genreId) => ({ genreId })) }
                  : undefined,
            },
            include: {
              author: true,
              location: true,
              bookGenres: { include: { genre: true } },
            },
          });
        }

        return this.prisma.book.update({
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
            bookGenres: { include: { genre: true } },
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
        return this.prisma.book.delete({
          where: { id },
        });
      },
      'delete',
      id,
    );
  }
}
