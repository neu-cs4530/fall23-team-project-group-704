import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import User from './user';

@Entity()
export default class Document {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @OneToMany(() => User, u => u.id)
  allowedUsersView: string[];

  @OneToMany(() => User, u => u.id)
  allowedUsersEdit: string[];

  @Column()
  data: string;

  @Column()
  uploaded_data: string[];
}
