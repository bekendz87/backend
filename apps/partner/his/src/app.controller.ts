import { Controller, Inject, Logger, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { HISService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { compareAsc, format } from "date-fns";
import { isObjectIdOrHexString } from 'mongoose';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';


@Controller()
export class HISController {

  private logger: LoggerService;
  constructor(
    @Inject() private readonly appService: HISService,
    @Inject() private readonly Helper: Helper,

  ) {
    this.logger = new LoggerService();
  }

  @MessagePattern({ cmd: 'login-his' })
  async loginHis(_: any) {
    try {
      const { meta, hospital_source } = _
      if (!meta) {
        return false
      }

      if (!hospital_source) {
        return false
      }

      return await this.appService.login(meta, hospital_source)

    } catch (ex) {
      this.logger.error(ex)
      return ex
    }

  }
  @MessagePattern({ cmd: 'search-patient-his' })
  async searchPatient(_: any) {
    try {
      return await this.appService.searchPatient(_)
    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }





}
