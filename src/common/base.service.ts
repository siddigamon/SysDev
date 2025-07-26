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
        case 'P2003': {
          let message: string;
          switch (this.modelName) {
            case 'Author':
              message = `Cannot delete ${this.modelName.toLowerCase()} with associated books. Please remove books first.`;
              break;
            case 'Genre':
              message = `Cannot delete ${this.modelName.toLowerCase()} with associated books. Please remove book-genre associations first.`;
              break;
            case 'Location':
              message = `Cannot delete ${this.modelName.toLowerCase()} with associated books. Please move books to another location or set location as inactive.`;
              break;
            default:
              message = 'Cannot delete record with existing references';
          }
          throw new ConflictException(message);
        }
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

    const errorMessage = id
      ? `Failed to ${operation} ${this.modelName.toLowerCase()} with ID ${id}`
      : `Failed to ${operation} ${this.modelName.toLowerCase()}`;

    throw new BadRequestException(errorMessage);
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    id?: number,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
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
