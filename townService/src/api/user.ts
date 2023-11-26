import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userName: string;

  @Column({ select: false })
  password: string;
}
