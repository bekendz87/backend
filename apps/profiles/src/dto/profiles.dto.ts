import {
    IsDate,
    isInt,
    IsMongoId,
    IsNotEmpty,
    IsNotIn,
    IsNumber,
    IsNumberString,
    IsObject,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateAccountsDTO {
    @IsString({ message: 'ID người dùng phải là chuỗi !' })
    @IsNotEmpty({ message: "Thông tin người dùng không được để trống !" })
    @IsMongoId({ message: "ID người dùng không đúng định dạng !" })
    user: string

    @IsNotEmpty({ message: "Số dư không được để trống !" })
    @IsNumber()
    balance: number
    
}