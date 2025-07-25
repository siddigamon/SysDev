import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const { genreIds, ...bookData } = createBookDto;

    return this.prisma.book.create({
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
  }

  async findAll() {
    return this.prisma.book.findMany({
      include: {
        author: true,
        location: true,
        bookGenres: {
          include: { genre: true },
        },
      },
    });
  }

  async findOne(id: number) {
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
  }

  async findByAuthor(authorId: number) {
    const authorExists = await this.prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!authorExists) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }

    return this.prisma.book.findMany({
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
  }

  async findByGenre(genreId: number) {
    await this.prisma.genre.findUniqueOrThrow({
      where: { id: genreId },
    });

    return this.prisma.book.findMany({
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
  }

  async findByLocation(locationId: number) {
    await this.prisma.location.findUniqueOrThrow({
      where: { id: locationId },
    });

    return this.prisma.book.findMany({
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
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    const { genreIds, ...bookData } = updateBookDto;

    // If genreIds are provided, we need to update the many-to-many relationship
    if (genreIds !== undefined) {
      // First, delete existing genre relationships
      await this.prisma.bookGenre.deleteMany({
        where: { bookId: id },
      });

      // Then create new ones
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
          bookGenres: {
            include: { genre: true },
          },
        },
      });
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // Delete the book (BookGenre records will be deleted automatically due to onDelete: Cascade)
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
