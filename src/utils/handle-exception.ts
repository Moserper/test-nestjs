import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

export const handleException = (err: any) => {
  if (err instanceof BadRequestException)
    throw new BadRequestException(err.getResponse());
  if (err instanceof InternalServerErrorException)
    throw new InternalServerErrorException(err);
  throw err;
};
