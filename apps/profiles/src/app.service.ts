import { isObjectIdOrHexString, Model } from 'mongoose';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ClientProxy } from '@nestjs/microservices';

import { Helper } from '@shared/helper/helper.service';
import { firstValueFrom } from 'rxjs';
import { fa, faker } from '@faker-js/faker';
import * as Helpers from '@shared/helper/reponseData';
import { Profiles, ProfilesSchema } from './schema/profiles.schema';
import { LoggerService } from '@shared/logger/logger.services';
import { isEmpty, isObject } from 'class-validator';
import { format } from 'date-fns';

const url = process && process.env && process.env.URL_IMAGE ? process.env.URL_IMAGE : ""
const physical_path = process && process.env && process.env.PHYSICAL_PATH ? process.env.PHYSICAL_PATH : ""

@Injectable()
export class ProfilesService {
    private logger: LoggerService;
    constructor(
        @InjectModel(Profiles.name) private profilesModel: Model<Profiles>,
        @Inject('common_used') private readonly commonUsed: ClientProxy,
        @Inject('his') private readonly his: ClientProxy,
        @Inject('users') private readonly user: ClientProxy,
        private readonly Helper: Helper,
    ) {
        this.logger = new LoggerService();
    }

    async CreateProfileIfNotExist(data: any, user: any, hospital_source: string) {
        try {
            if (user && !user._id || !user) {
                return null;
            }
            const { name, username, birthday, sex, address, province, patient_code, district, ward, phone } = data;

            const { last_name, first_name } = <any>this.Helper.ConvertFullNameToLastFrist(name);

            const owner = await this.findOneByOptions({ user: user && user._id ? user._id : "", relationship: 'owner' })

            const formatDate = this.Helper.formatDate(birthday)

            let newProfile = {
                user: user && user._id ? user._id : "",
                first_name: first_name || "",
                last_name: last_name || "",
                name: name || "",
                sex: sex || "",
                deleted: false,
                active: true
            }
            const duplicateProfile = await this.checkProfilesDuplicate(newProfile, data, patient_code, hospital_source)

            if (!duplicateProfile || duplicateProfile == null) {
                newProfile = {
                    ...newProfile,
                }

                newProfile['birthday'] = formatDate
                newProfile['relationship'] = !owner ? "owner" : "other"
                newProfile['location'] = {
                    province,
                    district,
                    address,
                    ward
                }
                newProfile['phone'] = username || phone
                newProfile['phones'] = [username || phone]
                newProfile['names'] = [name]
                newProfile['current_holder'] = user && user._id ? user._id : ""

                if (hospital_source == "hong_duc") {
                    newProfile["his_profile"] = {
                        patient_code: patient_code
                    }
                } else {
                    newProfile[hospital_source] = {
                        patient_code: patient_code
                    }
                }

                const result = await this.profilesModel.create(newProfile);

                let patient_codes = {}
                if (hospital_source == "hong_duc") {
                    patient_codes['his_profile.patient_code'] = newProfile["his_profile"].patient_code
                } else {
                    patient_codes[`${hospital_source}.patient_code`] = newProfile[hospital_source].patient_code
                }

                await this.UpdateProfileCurrentHolder(newProfile && newProfile.user ? newProfile.user : "", patient_codes);

                return result;
            }
            return duplicateProfile
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async findOneByOptions(options: any) {
        try {
            const data = await this.profilesModel.findOne(options)
            return data;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async checkProfilesDuplicate(newProfile: any, data: any, patient_code: string, hospital_source: any) {
        try {
            let duplicateProfile = <any>null

            duplicateProfile = <any>await this.profilesModel.findOne(newProfile).lean();
            if (duplicateProfile) {
                let condUpdate = {}
                condUpdate['his_profile.patient_code'] = data.patient_code || patient_code

                if (hospital_source == "hong_duc") {
                    if (duplicateProfile && duplicateProfile.his_profile
                        && duplicateProfile.his_profile.patient_code && duplicateProfile.his_profile.patient_code !== patient_code) {
                        await this.profilesModel.updateOne({ _id: duplicateProfile._id }, condUpdate);
                        duplicateProfile.his_profile = { ...duplicateProfile.his_profile, patient_code };
                    } else {
                        await this.profilesModel.updateOne({ _id: duplicateProfile._id }, condUpdate);
                        duplicateProfile.his_profile = { ...duplicateProfile.his_profile, patient_code };
                    }

                } else {
                    condUpdate[`${hospital_source}.patient_code`] = data.patient_code || patient_code
                    if (
                        duplicateProfile && duplicateProfile[hospital_source]
                        && duplicateProfile[hospital_source].patient_code
                        && duplicateProfile[hospital_source].patient_code !== patient_code) {

                        await this.profilesModel.updateOne({ _id: duplicateProfile._id }, condUpdate);

                        duplicateProfile[hospital_source] = { ...duplicateProfile[hospital_source], patient_code };
                    } else {

                        await this.profilesModel.updateOne({ _id: duplicateProfile._id }, condUpdate);
                        duplicateProfile[hospital_source] = { ...duplicateProfile[hospital_source], patient_code };

                    }

                }

            }
            return duplicateProfile;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async UpdateProfileCurrentHolder(user: string, patient_code: any, origin = null) {
        try {
            if (!patient_code && !user) {
                await this.profilesModel.updateMany({ patient_code, deleted: false },
                    {
                        current_holder: user,
                        holder_modified_time: Date.now(),
                        origin: origin
                    });

                return true;
            }
            return false;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async SearchProfileFromHis(data: any) {
        try {
            const pattern = { cmd: 'search-patient-his' };
            if (!data.phone && !data.patient_code && !data.source) {
                return false
            }

            const payload = {
                ...data
            }

            const reponse = await firstValueFrom(this.his.send<any>(pattern, payload));
            return reponse

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async searchProfile(dataHis: any, dataDROH: any) {
        try {

            if (dataHis.result && !isEmpty(dataHis.data)) {
                const data = dataHis && dataHis.data ? dataHis.data : [];
                let user = data[0];
                let arrPhone = user && user.phone_number && user.phone_number.split(/\D+/gi) ? user.phone_number.split(/\D+/gi) : ""

                if (arrPhone.length > 0 && this.Helper.ValidPhone(arrPhone[0])) {
                    user.phone_number = arrPhone[0]
                }

                user.phone_number = user && user.phone_number && user.phone_number.replace(/\D/g, '') ? user.phone_number.replace(/\D/g, '') : "";

                let current_holder = <any>await this.GetCurrentHolder(user.patient_code, true, dataDROH.source);

                if (current_holder && process.env.USE_CURRENT_HOLDER) {
                    user.phone_number = current_holder.username;
                }

                const userDroh = await this.findUserByPhone(user && user.phone_number ? user.phone_number : "")

                if (user.date_of_birth) {
                    const arrDate = user.date_of_birth.split('-')

                    if (arrDate.length > 1 && arrDate[1] == '00') {
                        user.date_of_birth = `${arrDate[0]}-01-01`;
                    }

                }

                let resp = {
                    name: user.name || "",
                    sex: user.gender || "",
                    birthday: format(user.date_of_birth, 'dd/MM/yyyy'),
                    existed: false
                }

                let province = <any>{};
                let district = <any>{};
                let ward = <any>{};

                if (user.province_id) {
                    province = await this.FindProvinceWithHDId(user.province_id)
                    if (province && province.status == 200) {
                        province = province && province.one_health_msg && province.one_health_msg[0] ? province.one_health_msg[0] : {}
                    }
                }

                if (user.district_id) {
                    district = await this.FindDistrictWithHDId(user.district_id)
                    if (district && district.status == 200) {
                        district = district && district.one_health_msg && district.one_health_msg[0] ? district.one_health_msg[0] : {}
                    }
                }

                let disId = district ? district.district_id : process.env.DISTRICT_ID_DEFAULT;
                if (!user.ward_name || user.ward_name == "") {
                    disId = 99999
                }


                if (user.ward_name) {
                    ward = await this.FindWithNameAndDistrict(disId, user.ward_name);
                    if (ward && ward.status == 200) {
                        ward = ward && ward.one_health_msg && ward.one_health_msg[0] ? ward.one_health_msg[0] : {}
                    }
                }

                if (userDroh) {
                    resp['existed'] = true
                }

                resp['province'] = province
                resp['district'] = district
                resp['ward'] = ward
                resp['address'] = user && user.street ? user.street : "";
                resp['patient_code'] = user && user.patient_code ? user.patient_code : "";

                if (user && user.phone_number.indexOf(' ') > -1) {
                    user.phone_number.replace(new RegExp(' ', 'g'), '')
                }

                resp['username'] = user && user.phone_number ? user.phone_number : ""
                resp['profiles'] = []

                for (let j = 0; j < data.length; j++) {
                    const i = data[j];

                    let pro = await this.FindProvinceWithHDId(i.province_id)
                    if (pro && pro.status == 200) {
                        pro = pro && pro.one_health_msg && pro.one_health_msg[0] ? pro.one_health_msg[0] : {}
                    }

                    let dis = await this.FindDistrictWithHDId(i.district_id)
                    if (dis && dis.status == 200) {
                        dis = dis && dis.one_health_msg && dis.one_health_msg[0] ? dis.one_health_msg[0] : {}
                    }


                    let districtId = dis ? dis.district_id : process.env.DISTRICT_ID_DEFAULT
                    if (!i.ward_name || i.ward_name == "") {
                        districtId = 99999
                    }

                    let wad = await this.FindWithNameAndDistrict(districtId, i.ward_name);
                    if (wad && wad.status == 200) {
                        wad = wad && wad.one_health_msg && wad.one_health_msg[0] ? wad.one_health_msg[0] : {}
                    }

                    resp['profiles'].push({
                        name: i.name,
                        sex: i.gender,
                        birthday: format(i.date_of_birth, 'dd/MM/yyyy'),
                        province: pro ? JSON.parse(JSON.stringify(pro)) : null,
                        district: dis ? JSON.parse(JSON.stringify(dis)) : null,
                        ward: wad,
                        address: i.street,
                        patient_code: i.patient_code,
                        phone: i.phone_number
                    })

                }

                return this.Helper.ResponseFormat(HttpStatus.OK, resp, {})

            } else {
                return this.Helper.ResponseFormat(HttpStatus.OK, dataHis && dataHis.data ? dataHis.data : {}, {})
            }


        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async GetCurrentHolder(patient_code: string, populate: Boolean, source: string) {
        try {
            let query = 'his_profile.patient_code';

            if (source != 'hong_duc') {
                query = `${source}.patient_code`
            }

            if (!isEmpty(patient_code)) {

                let profilesWithHolder = <any>this.profilesModel.find({
                    [query]: patient_code, deleted: false,
                    current_holder: { '$exists': true }
                }).sort({ 'modified_time': -1 }).limit(1);

                if (populate) {
                    profilesWithHolder = profilesWithHolder.populate('user');
                }

                profilesWithHolder = await profilesWithHolder.lean();

                if (!isEmpty(profilesWithHolder)) {
                    return profilesWithHolder[0].user;
                }

                let profiles = <any>this.profilesModel.find({ [query]: patient_code, deleted: false }).sort({ 'modified_time': -1 }).limit(1);
                if (populate) {
                    profiles = profiles.populate('user');
                }

                profiles = await profiles.lean();

                if (!isEmpty(profiles)) {
                    return profiles[0].user;
                }

            }
            return null;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }

    }

    async findUserByPhone(phone: string) {
        try {
            const pattern = { cmd: 'find-users-by-username' };

            const payload = {
                username: phone ? phone : ""
            }
            const data = await firstValueFrom(this.user.send<any>(pattern, payload));
            return data
        } catch (ex) {
            this.logger.error(ex)
        }
    }

    async FindProvinceWithHDId(id: number) {
        try {
            const pattern = { cmd: 'province-find-byId' };
            if (!id) {
                return false
            }

            const payload = {
                id: id
            }

            const data = await firstValueFrom(this.commonUsed.send(pattern, payload))
            return data
        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    async FindDistrictWithHDId(id: number) {
        try {
            const pattern = { cmd: 'districts-find-byId' };
            if (!id) {
                return false
            }

            const payload = {
                id: id
            }

            return await firstValueFrom(this.commonUsed.send(pattern, payload))

        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    async FindWithNameAndDistrict(id: number, name: string) {
        try {
            const pattern = { cmd: 'ward-find-byName-AndDistricID' };
            if (!id) {
                return false
            }

            const payload = {
                districtId: id,
                name: name
            }

            return await firstValueFrom(this.commonUsed.send(pattern, payload))

        } catch (ex) {
            this.logger.error(ex)
            return false
        }
    }

    async UpdateOwner(data: any, userId: string) {
        try {
            if (!data) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrInvalidRequest)
            }

            if (!userId && !isObjectIdOrHexString(userId)) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrUsersNotExist)
            }

            let user = await this.findUserByID(userId)
            if (user && user.status == 200) {
                user = user && user.one_health_msg ? user.one_health_msg : {}
            }

            const formatDate = this.Helper.formatDate(data && data.date_of_birth ? data.date_of_birth : "")

            let userUpdate = {
                name: data && data.name ? data.name : "",
                sex: data.sex == 'male' ? 1 : 2,
                birthday: formatDate,
                province: data && data.province ? data.province : {},
                district: data && data.district ? data.district : {},
                ward: data && data.ward ? data.ward : {},
                address: data && data.address ? data.address : ""
            };

            if (data.name) {
                const { last_name, first_name } = <any>this.Helper.ConvertFullNameToLastFrist(data && data.name ? data.name : "")
                userUpdate['last_name'] = last_name
                userUpdate['first_name'] = first_name
            }

            const updateUsers = await this.updateUsersWithOptions(user && user._id ? user._id : "", userUpdate)
            if (updateUsers && updateUsers.status != 200) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrUpdate)
            }

            const profile = await this.findOneByOptions({ user: (user && user._id ? user._id : ""), relationship: 'owner' })


            if (profile) {

                const updatePro = {
                    name: data && data.name ? data.name : "",
                    sex: data && data.sex ? data.sex : "",
                    birthday: formatDate,
                    last_name: userUpdate && userUpdate['last_name'] ? userUpdate['last_name'] : "",
                    first_name: userUpdate && userUpdate['first_name'] ? userUpdate['first_name'] : "",
                    location: {
                        province: userUpdate && userUpdate.province ? userUpdate.province : "",
                        district: userUpdate && userUpdate.district ? userUpdate.district : "",
                        address: userUpdate && userUpdate.address ? userUpdate.address : "",
                        ward: userUpdate && userUpdate.ward ? userUpdate.ward : ""
                    },
                    phones: [user && user.username ? user.username : ""],
                    names: [data && data.name ? data.name : ""],
                    his_profile: {
                        patient_code: data && data.patient_code ? data.patient_code : ""
                    }
                }

                await this.updateWithOptions(profile && profile._id ? profile._id : "", updatePro)
            } else {

                const createdProfile = {
                    user: user && user._id ? user._id : "",
                    relationship: 'owner',
                    name: data && data.name ? data.name : "",
                    sex: data && data.sex ? data.sex : "",
                    birthday: formatDate,
                    last_name: userUpdate && userUpdate['last_name'] ? userUpdate['last_name'] : "",
                    first_name: userUpdate && userUpdate['first_name'] ? userUpdate['first_name'] : "",
                    location: {
                        province: userUpdate && userUpdate.province ? userUpdate.province : "",
                        district: userUpdate && userUpdate.district ? userUpdate.district : "",
                        address: userUpdate && userUpdate.address ? userUpdate.address : "",
                        ward: userUpdate && userUpdate.ward ? userUpdate.ward : ""
                    },
                    phones: [user && user.username ? user.username : ""],
                    names: [data && data.name ? data.name : ""],
                    his_profile: {
                        patient_code: data && data.patient_code ? data.patient_code : ""
                    }
                };

                await this.create(createdProfile)
            }

            if (data.profiles.length > 1) {
                for (let i = 1; i < data.profiles.length; i++) {
                    let item = data.profiles[i];

                    let profiles = {
                        location: {
                            province: item && item.province ? item.province : {},
                            district: item && item.district ? item.district : {},
                            ward: item && item.ward ? item.ward : {},
                            address: item && item.address ? item.address : ""
                        }
                    };

                    const createdProfileOther = {
                        user: user && user._id ? user._id : "",
                        name: item && item.name ? item.name : "",
                        sex: item && item.sex ? item.sex : "",
                        birthday: formatDate,
                        location: profiles && profiles.location ? profiles.location : {},
                        phones: [item && item.username ? item.username : ""],
                        names: [item && item.name ? item.name : ""],
                        his_profile: {
                            patient_code: item && item.patient_code ? item.patient_code : ""
                        }
                    }

                    const checkduplicate = await this.checkProfilesDuplicate(createdProfileOther, item,
                        item && item.patient_code ? item.patient_code : "", 'hong_duc')

                    if (!checkduplicate || checkduplicate == null) {

                        const { last_name, first_name } = <any>this.Helper.ConvertFullNameToLastFrist(item && item.name ? item.name : "")
                        profiles['last_name'] = last_name
                        profiles['first_name'] = first_name

                        createdProfileOther['last_name'] = last_name
                        createdProfileOther['first_name'] = first_name
                        createdProfileOther['relationship'] = 'other'

                        await this.create(createdProfileOther)
                    }

                }
            }

            return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdate, "")

        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, ex && ex.message ? ex.message : "")
        }
    }

    async findUserByID(id: string) {
        try {
            const pattern = { cmd: 'find-users-by-id' };

            const payload = {
                id: id ? id : ""
            }
            const data = await firstValueFrom(this.user.send<any>(pattern, payload));
            return data
        } catch (ex) {
            this.logger.error(ex)
        }
    }

    async updateUsersWithOptions(id: string, opstions: any) {
        try {
            const pattern = { cmd: 'users-update-refesh-token' };

            const payload = {
                id: id ? id : "",
                opstions: opstions
            }
            const data = await firstValueFrom(this.user.send<any>(pattern, payload));
            return data
        } catch (ex) {
            this.logger.error(ex)
        }
    }

    async updateWithOptions(id: string, options: any) {
        try {
            if (!id && !options) {
                return false
            }
            const data = await this.profilesModel.findOneAndUpdate({ _id: id }, { $set: options })
            return data;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async create(data: any) {
        try {
            const create = await this.profilesModel.create(data)
            return create
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, ex && ex.message ? ex.message : "")
        }
    }

    async findProfileOwnerbyUserId(id: string) {
        try {
            if (!id) {
                return false
            }

            const data = await this.profilesModel.findById({
                user: id, relationship: 'owner', deleted: {
                    $ne: true
                }
            })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, ex && ex.message ? ex.message : "")
        }
    }
    async UpdateProfileForUserUpdate(user: any) {
        try {

        } catch (ex) {

        }
    }

}