import { IsNotEmpty } from "class-validator";

export class seenNoti {
    @IsNotEmpty({ message: "ID thông báo không được để trống !" })
    id: string
}

export class sendNoti {
    @IsNotEmpty({ message: "Người nhận thông báo không được để trống !" })
    toId: string

    @IsNotEmpty({ message: "Dữ liệu thông báo không được để trống !" })
    extra: Object

    @IsNotEmpty({ message: "Loại thông báo không được để trống !" })
    type: string

    @IsNotEmpty({ message: "Nội dung thông báo không được để trống !" })
    content: string

    @IsNotEmpty({ message: "Hành động thông báo không được để trống !" })
    action: string

    @IsNotEmpty({ message: "Tiêu đề thông báo không được để trống !" })
    title: string

    @IsNotEmpty({ message: "Mã xác thực gửi thông báo không được để trống !" })
    regesToken: string
}