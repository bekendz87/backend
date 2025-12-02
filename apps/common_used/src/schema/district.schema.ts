import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Province } from './province.schema';

@Entity()
export class District {
    @PrimaryColumn()
    district_id: Number

    @Column({ nullable: true })
    province_id: Number

    @Column({ nullable: true })
    vi_name: string

    @Column({ nullable: true })
    en_name: string

    @Column({ nullable: true })
    ub_id: Number

    @Column({ nullable: true })
    ub_province_id: Number

    @Column( { nullable: true })
    nd_id: Number

    @Column( { nullable: true })
    bvhd_id: Number

    @Column({ nullable: true })
    bvhd_province_id: Number

    @Column({ default: 0 })
    disabled: Number

}




