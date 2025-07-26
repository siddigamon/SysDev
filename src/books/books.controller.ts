import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ChangeBookStatusDto,
  StatusOperationDto,
} from '../common/dto/status.dto';
import { BookStatus } from '@prisma/client';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(
    @Query('authorId', new ParseIntPipe({ optional: true })) authorId?: number,
    @Query('genreId', new ParseIntPipe({ optional: true })) genreId?: number,
    @Query('locationId', new ParseIntPipe({ optional: true }))
    locationId?: number,
    @Query('includeRetired') includeRetired?: string,
    @Query('status') status?: BookStatus,
  ) {
    // Build filter object - much cleaner!
    const filters = {
      authorId,
      genreId,
      locationId,
      status,
      includeRetired: includeRetired === 'true',
    };

    return this.booksService.findAllWithFilters(filters);
  }
  @Get('available')
  findAvailable() {
    return this.booksService.findAvailable();
  }

  @Get('checked-out')
  findCheckedOut() {
    return this.booksService.findCheckedOut();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  // Status management endpoints
  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeBookStatusDto,
  ) {
    return this.booksService.changeStatus(id, changeStatusDto);
  }

  @Patch(':id/check-out')
  checkOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusOperationDto,
  ) {
    return this.booksService.checkOut(id, statusDto.reason);
  }

  @Patch(':id/check-in')
  checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.checkIn(id);
  }

  @Patch(':id/mark-lost')
  markAsLost(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusOperationDto,
  ) {
    return this.booksService.markAsLost(id, statusDto.reason);
  }

  @Patch(':id/mark-damaged')
  markAsDamaged(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusOperationDto,
  ) {
    return this.booksService.markAsDamaged(id, statusDto.reason);
  }

  @Patch(':id/send-to-repair')
  sendToRepair(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusOperationDto,
  ) {
    return this.booksService.sendToRepair(id, statusDto.reason);
  }

  @Patch(':id/move-to-storage')
  moveToStorage(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusOperationDto,
  ) {
    return this.booksService.moveToStorage(id, statusDto.reason);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id); // This retires the book
  }
}
