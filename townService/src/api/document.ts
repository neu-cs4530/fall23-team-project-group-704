import { Entity, Column, OneToMany, PrimaryColumn, CreateDateColumn } from 'typeorm';
import Users from './user';

@Entity({ name: 'Documents' })
export default class Documents {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column()
  data: string;

  @CreateDateColumn()
  date: Date;
}
