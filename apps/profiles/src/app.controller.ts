import { Controller, Inject, Logger, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ProfilesService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { compareAsc, format } from "date-fns";
import * as Helpers from '@shared/helper/reponseData';
import { isObjectIdOrHexString } from 'mongoose';
import { CreateAccountsDTO } from './dto/profiles.dto';
import { LoggerService } from '@shared/logger/logger.services';


@Controller()
export class ProfilesController {

  private logger: LoggerService;
  constructor(
    @Inject() private readonly appService: ProfilesService,
    @Inject() private readonly Helper: Helper,

  ) {
    this.logger = new LoggerService();
  }

  @MessagePattern({ cmd: "profiles-check-and-create-notexist" })
  async checkProfileAndCreateNotExist(_: any) {
    try {
      const { data, user, hospital_source } = _
      const datas = await this.appService.CreateProfileIfNotExist(data, user, hospital_source)
      return datas
    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: "profiles-search-profile-with-patientCode" })
  async searchProfileByPatientCode(_: any) {
    try {

      if (!_.phone && !_.patient_code && !_.source) {
        return false
      }

      const dataHIS = await this.appService.SearchProfileFromHis(_)
      if (!dataHIS || dataHIS.error.code !== 200 && dataHIS.success == false) {
        this.logger.error(dataHIS.error.message)
        return dataHIS
      }

      const dataProfile = await this.appService.searchProfile(dataHIS, _)

      return dataProfile
    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: 'profiles-update-owner' })
  async updateOwner(_: any) {
    try {
      const { data, userId } = _

      if (!data) {
        return false
      }

      if (!userId) {
        return false
      }

      const datas = await this.appService.UpdateOwner(data, userId)
      return datas

    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: 'profiles-find-id' })
  async findById(_: any) {
    try {
      const id = _ && _.id ? _.id : ""
      if (!id) {
        return false
      }

      const data = await this.appService.findOneByOptions({ _id: id })

      return data
    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }

  @MessagePattern({ cmd: 'profiles-update-profile-for-users' })
  async updateProfilesFromUsers(_: any) {
    try {
      const user = _ && _.user ? _.user : {}
      if (!user) {
        return false
      }
      const name = `${(user && user.last_name ? user.last_name : "")} ${(user && user.first_name ? user.first_name : "")}`
      const strSex = user && user.sex && user.sex == 1 ? 'male' : 'female'
      const checkProfiles = <any>await this.appService.findProfileOwnerbyUserId(user && user._id ? user._id : "");

      const dataProfile = <any>{
        user: user && user._id ? user._id : "",
        first_name: user && user.first_name ? user.first_name : "",
        last_name: user && user.last_name ? user.last_name : "",
        names: [name],
        name: name,
        birthday: user && user.birthday ? user.birthday : "",
        phone: user && user.username ? user.username : "",
        phones: [user && user.username ? user.username : ""],
        relationship: 'owner',
        sex: strSex,
        location: {
          province: user && user.province ? user.province : {},
          district: user && user.district ? user.district : {},
          ward: user && user.ward ? user.ward : {},
          address: user && user.address ? user.address : ""
        },
        his_profile: user && user.his_profile ? user.his_profile : {},
        identity_num: user && user.identity_num ? user.identity_num : ""

      };

      if (!checkProfiles) {

        const created = await this.appService.create(dataProfile)

        return created;
      } else {
        delete dataProfile.relationship


        if (name.toUpperCase().trim() != checkProfiles.name.toUpperCase().trim() &&
          strSex != checkProfiles.sex &&
          format(user.birthday, 'DD/MM/YYYY') != format(checkProfiles.birthday, 'DD/MM/YYYY')) {

          const updateProfile = await this.appService.updateWithOptions(checkProfiles && checkProfiles._id ? checkProfiles._id : "", dataProfile)
          return updateProfile
        }

      }
      return true

    } catch (ex) {
      this.logger.error(ex)
      return ex
    }
  }


}
