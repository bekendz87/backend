import { IsNotEmpty } from "class-validator";

export class CreateFirebaseDTO {
    @IsNotEmpty({ message: "ID người dùng không được để trống !" })
    userId: string

    @IsNotEmpty({ message: "Token không được để trống !" })
    token: string
}

export class CreateDeviceDTO {
    @IsNotEmpty({ message: "ID người dùng không được để trống !" })
    userId: string

    @IsNotEmpty({ message: "Token không được để trống !" })
    token: string

    @IsNotEmpty({ message: "Mã thiết bị không được để trống !" })
    device_id: string
}

export class ParamsUpdate {
    @IsNotEmpty({ message: "ID không được để trống !" })
    id: string


}