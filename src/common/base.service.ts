import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export abstract class BaseService<TModel, TCreateDto, TUpdateDto> {
  constructor(
    protected prisma: PrismaService,
    protected modelName: string,
  ) {}

  protected handlePrismaError(
    error: any,
    operation: string,
    id?: number,
  ): never {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            `${this.modelName} with this information already exists`,
          );

        case 'P2025':
          throw new NotFoundException(
            id
              ? `${this.modelName} with ID ${id} not found`
              : `${this.modelName} not found`,
          );

        default:
          throw new InternalServerErrorException('Database error occurred');
      }
    }

    // Generic fallback
    throw new BadRequestException(
      `Failed to ${operation} ${this.modelName.toLowerCase()}`,
    );
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    id?: number,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Handle Prisma errors
      this.handlePrismaError(error, operationName, id);
    }
  }

  protected getActiveBookFilter() {
    return { status: { not: 'RETIRED' as any } };
  }

  protected getActiveLocationFilter() {
    return { status: 'ACTIVE' as any };
  }
}
