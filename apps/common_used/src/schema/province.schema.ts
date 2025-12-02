import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity()
export class Province {
    @PrimaryColumn()
    province_id: Number;

    @Column()
    code: Number;

    @Column()
    vi_name: string

    @Column()
    en_name: string

    @Column({ nullable: true })
    ub_id: Number

    @Column({ nullable: true })
    nd_id: string

    @Column({ nullable: true })
    bvhd_id: Number


    @Column( { default: 0 })
    disabled: Number
}


