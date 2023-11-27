import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import Users from './user';

@Entity({ name: 'Documents' })
export default class Documents {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @OneToMany(() => Users, u => u.id)
  allowedusersview: string[];

  @OneToMany(() => Users, u => u.id)
  allowedusersedit: string[];

  @Column()
  data: string;
}
