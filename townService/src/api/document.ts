import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from 'typeorm';
import { User } from './user';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: User;

  @Column()
  name: string;

  @OneToMany(() => User, (u) => u.id)
  allowedUsersView: User[];

  @OneToMany(() => User, (u) => u.id)
  allowedUsersEdit: User[];

  @Column()
  data: string;

  @Column()
  uploaded_data: string[];
}
