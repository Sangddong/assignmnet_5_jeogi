import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Partner, User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import day from 'src/utils/day';
import { RoomsService } from './rooms.service';
import { DPartner } from 'src/decorators/partner.decorator';
import dayjs from 'dayjs';

@Controller('/accommodations/:accommodationId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Post('/:roomId/reservations')
  @Private('user')
  makeReservation(
    @DUser() user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    return this.roomsService.makeReservation(
      user.id,
      roomId,
      day(date).startOf('day').toDate(),
    );
  }

  //8
  @Post('/:roomId/reservations/:reservationId/check-in')
  @Private('partner')
  allocateCheckedInAt(
    @DPartner() partner: Partner,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body('date') date: string,
  ) {
    const inputDate = dayjs(date).toDate();
    return this.roomsService.allocateCheckedInAt(roomId, inputDate);
  }

  //9
  @Post('/:roomId/reservations/:reservationId/review')
  @Private('user')
  createReview(
    @DUser() user: User,
    @Param('roomId') roomId: number,
    @Body('date') date: string,
    @Body('rating') rating: number,
    @Body('content') content: string,
  ) {
    const inputDate = new Date();
    return this.roomsService.createReview(
      roomId,
      user.id,
      inputDate,
      rating,
      content,
    );
  }
}
