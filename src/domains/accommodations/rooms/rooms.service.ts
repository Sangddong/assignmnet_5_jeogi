import { th } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import {
  Accommodation,
  Prisma,
  Reservation,
  Review,
  Room,
} from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) { }

  async createRoom(
    accommodationId: Accommodation['id'],
    dataWithoutAccommodationId: Prisma.RoomCreateWithoutAccommodationInput,
  ) {
    const data: Prisma.RoomUncheckedCreateInput = {
      accommodationId,
      ...dataWithoutAccommodationId,
    };
    const room = await this.prismaService.room.create({ data });

    return room;
  }

  async deleteRoom(roomId: Room['id']) {
    const room = await this.prismaService.room.delete({
      where: { id: roomId },
    });

    return room;
  }

  async makeReservation(
    reservedById: Reservation['reservedById'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const reservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { reservedAt: new Date(), reservedById, isReserved: true },
    });
    return reservation;
  }

  //8
  async allocateCheckedInAt(
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    //(1). 예약된 방이 맞는지 확인
    const checkIsReserved = await this.prismaService.reservation.findFirst({
      where: {
        roomId,
        date,
        isReserved: true,
      },
    });

    //(2). 예약된 방이 아니라면 오류처리
    if (!checkIsReserved) {
      throw new Error('예약된 방이 아닙니다');
    }

    //(3). 예약된 방이라면 새 체크인 시간을 할당
    const checkedInAt = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { checkedInAt: new Date() },
    });

    return checkedInAt;
  }

  //9
  async createReview(
    roomId: Reservation['roomId'],
    userId: string,
    date: Reservation['date'],
    rating: Review['rating'],
    content: Review['content'],
  ) {
    //(1) 체크인되어있는지 확인
    const checkIsCheckedIn = await this.prismaService.reservation.findFirst({
      where: { roomId, date, checkedInAt: { not: null } },
    });

    //(2) 체크인되어있지 않으면 오류처리
    if (!checkIsCheckedIn) {
      throw new Error('체크인하지 않은 방입니다.');
    }
    //(3) 리뷰 작성하기
    const review = await this.prismaService.review.create({
      data: { userId, roomId, rating, content },
    });

    return review;
  }
}
