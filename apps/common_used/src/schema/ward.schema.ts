import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';




@Entity()
export class Ward {
    @PrimaryColumn()
    ward_id: Number;

    @Column()
    district_id: Number;

    @Column()
    auto_suggest_code: string;

    @Column()
    vi_name: string

    @Column()
    en_name: string

    @Column({ nullable: true })
    ub_id: string

    @Column({ nullable: true })
    nd_id: string

    @Column({ nullable: true })
    bvhd_id: Number

    @Column({ nullable: true })
    bvhd_district_id: Number

    @Column({ nullable: true })
    ub_district_id: Number

    @Column({ default: 0 })
    disabled: Number
}



