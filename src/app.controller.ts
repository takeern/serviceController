import { Controller, Get,  Req, Res, Param, Post, Query, Body, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() qu) {
    console.log(qu)
    return this.appService.getHello();
  }

  @Get('getBookNumber')
  async getBookNumber(@Query() qs) {
    // console.log(data);
    const b = await this.appService.getBookNumber(qs);
    return b;
  }
  @Get('getBookList')
  async getBookList(@Query() qs) {
    const b = await this.appService.getBookList(qs);
    return b;
  }
  @Get('getBookData')
  async getBookData(@Query() qs) {
    const b = await this.appService.getBookData(qs);
    return b;
  }
  @Get('getBookAllData')
  async getBookAllData(@Query() qs) {
    const b = await this.appService.getBookAllData(qs);
    return b;
  }
}
