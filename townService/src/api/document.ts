import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

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
