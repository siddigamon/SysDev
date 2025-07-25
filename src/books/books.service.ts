import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        ...createBookDto,
        publishedAt: new Date(createBookDto.publishedAt),
      },
      include: { author: true },
    });
  }

  async findAll() {
    return this.prisma.book.findMany({
      include: { author: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
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
      include: { author: true },
      orderBy: { publishedAt: 'asc' },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    return this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        publishedAt: updateBookDto.publishedAt
          ? new Date(updateBookDto.publishedAt)
          : undefined,
      },
      include: { author: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
