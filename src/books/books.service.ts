import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ChangeBookStatusDto } from '../common/dto/status.dto';
import { Book, BookStatus } from '@prisma/client';

interface BookFilters {
  authorId?: number;
  genreId?: number;
  locationId?: number;
  status?: BookStatus;
  includeRetired?: boolean;
}

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

  async findAll(includeRetired = false) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.book.findMany({
          where: includeRetired ? {} : this.getActiveBookFilter(),
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
          orderBy: { title: 'asc' },
        }),
      'retrieve',
    );
  }

  async findByStatus(status: BookStatus) {
    return this.executeWithErrorHandling(
      () =>
        this.prisma.book.findMany({
          where: { status },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
          orderBy: { title: 'asc' },
        }),
      'find by status',
    );
  }

  async findAvailable() {
    return this.findByStatus(BookStatus.AVAILABLE);
  }

  async findCheckedOut() {
    return this.findByStatus(BookStatus.CHECKED_OUT);
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

  // Status Management Methods
  async changeStatus(id: number, changeStatusDto: ChangeBookStatusDto) {
    return this.executeWithErrorHandling(
      async () => {
        await this.findOne(id);
        return this.prisma.book.update({
          where: { id },
          data: {
            status: changeStatusDto.status,
            statusReason: changeStatusDto.reason,
            statusDate: new Date(),
          },
          include: {
            author: true,
            location: true,
            bookGenres: { include: { genre: true } },
          },
        });
      },
      'change status',
      id,
    );
  }

  // Convenient status change methods
  async checkOut(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.CHECKED_OUT,
      reason: reason || 'Book checked out',
    });
  }

  async checkIn(id: number) {
    return this.changeStatus(id, {
      status: BookStatus.AVAILABLE,
      reason: 'Book returned and available',
    });
  }

  async markAsLost(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.LOST,
      reason: reason || 'Marked as lost',
    });
  }

  async markAsDamaged(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.DAMAGED,
      reason: reason || 'Marked as damaged',
    });
  }

  async sendToRepair(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.IN_REPAIR,
      reason: reason || 'Sent for repair',
    });
  }

  async moveToStorage(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.STORAGE,
      reason: reason || 'Moved to storage',
    });
  }

  async retire(id: number, reason?: string) {
    return this.changeStatus(id, {
      status: BookStatus.RETIRED,
      reason: reason || 'Book retired',
    });
  }

  // Filtering methods with status awareness
  async findByAuthor(authorId: number, includeRetired = false) {
    return this.executeWithErrorHandling(
      async () => {
        const authorExists = await this.prisma.author.findUnique({
          where: { id: authorId },
        });

        if (!authorExists) {
          throw new NotFoundException(`Author with ID ${authorId} not found`);
        }

        return this.prisma.book.findMany({
          where: {
            authorId,
            ...(includeRetired ? {} : this.getActiveBookFilter()),
          },
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

  async findByGenre(genreId: number, includeRetired = false) {
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
            ...(includeRetired ? {} : this.getActiveBookFilter()),
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

  async findByLocation(locationId: number, includeRetired = false) {
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
          where: {
            locationId,
            ...(includeRetired ? {} : this.getActiveBookFilter()),
          },
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

  /**
   * Updates book metadata, location, and genre associations
   * Does NOT change book status - use status-specific methods for that
   */
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

  async findAllWithFilters(filters: BookFilters) {
    return this.executeWithErrorHandling(async () => {
      // Build dynamic where clause
      const whereClause: any = {};

      // Add filters only if they exist
      if (filters.authorId) {
        whereClause.authorId = filters.authorId;
      }

      if (filters.genreId) {
        whereClause.bookGenres = {
          some: { genreId: filters.genreId },
        };
      }

      if (filters.locationId) {
        whereClause.locationId = filters.locationId;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      } else if (!filters.includeRetired) {
        whereClause.status = { not: 'RETIRED' };
      }

      // Validate referenced entities exist (only if provided)
      if (filters.authorId) {
        const authorExists = await this.prisma.author.findUnique({
          where: { id: filters.authorId },
        });
        if (!authorExists) {
          throw new NotFoundException(
            `Author with ID ${filters.authorId} not found`,
          );
        }
      }

      if (filters.genreId) {
        const genreExists = await this.prisma.genre.findUnique({
          where: { id: filters.genreId },
        });
        if (!genreExists) {
          throw new NotFoundException(
            `Genre with ID ${filters.genreId} not found`,
          );
        }
      }

      if (filters.locationId) {
        const locationExists = await this.prisma.location.findUnique({
          where: { id: filters.locationId },
        });
        if (!locationExists) {
          throw new NotFoundException(
            `Location with ID ${filters.locationId} not found`,
          );
        }
      }

      return this.prisma.book.findMany({
        where: whereClause,
        include: {
          author: true,
          location: true,
          bookGenres: { include: { genre: true } },
        },
        orderBy: { title: 'asc' },
      });
    }, 'find books with filters');
  }

  // "Delete" now means retire
  async remove(id: number) {
    return this.retire(id, 'Book retired via DELETE API');
  }
}
