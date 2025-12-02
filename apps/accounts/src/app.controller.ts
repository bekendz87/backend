import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { AccountsService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { CreateAccountsDTO } from './dto/accounts.dto';
import { LoggerService } from '@shared/logger/logger.services';
import { PointAccountService } from '@common_used/services/point_account.services';
import * as Helpers from '@shared/helper/reponseData';
@Controller()
export class AccountsController {

  private logger: LoggerService;


  constructor(
    @Inject() private readonly appService: AccountsService,
    @Inject() private readonly Helper: Helper,
    @Inject() private readonly pointAccountService: PointAccountService,
  ) {
    this.logger = new LoggerService();
  }

  @MessagePattern({ cmd: 'accounts-create' })
  async create(_: CreateAccountsDTO) {
    try {

      const data = await this.appService.create(_);
      return data

    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: 'accounts-get-balance' })
  async getBalance(_: any) {
    try {
      const userId = _ && _.user ? _.user : ""
      const options = {
        excludeField: ['user']
      }


      let checkAccounts = await this.appService.FindOneByUserID(userId, options);

      if (!checkAccounts) {
        return {}
      }

      if (checkAccounts && checkAccounts.balance) {
        checkAccounts.balance = Math.floor(checkAccounts && checkAccounts.balance ? checkAccounts.balance : 0);
      }

      let checkPointAccount = await this.pointAccountService.findOne(userId)

      if (!checkPointAccount) {
        return false
      }

      checkPointAccount = checkPointAccount && checkPointAccount.balance ? checkPointAccount.balance : 0
      if (typeof checkPointAccount !== 'number') {
        return checkAccounts
      }

      let fUser = await this.appService.findUsers(userId)

      if (fUser && fUser.status == 200) {
        fUser = fUser && fUser.one_health_msg ? fUser.one_health_msg : {}
        fUser = { username: fUser && fUser.username ? fUser.username : "" }
      }

      checkAccounts.point = checkPointAccount

      const mergedObj = { ...(checkAccounts && checkAccounts._doc ? checkAccounts._doc : checkAccounts), ...fUser }

      return mergedObj
    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: 'accounts-check-balance' })
  async checkBalance(_: any) {
    try {
      const { user, type } = _
      if (!user) {
        return false
      }

      if (!type) {
        return false
      }

      const checkAccounts = await this.appService.findAccountsUserWithId(user);
      if (!checkAccounts) {
        return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrAccountNotFound)
      }



    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }



}
