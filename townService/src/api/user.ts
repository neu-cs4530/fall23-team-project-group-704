import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Users' })
export default class Users {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;
}
