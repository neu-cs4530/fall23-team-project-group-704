import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Document from './document';

@Entity()
export default class DocumentDirectory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Document, d => d.name)
  Documents: Document[];

  // @OneToMany(() => DocumentDirectory, (d) => d.name)
  // DocumentDirectory: DocumentDirectory[];
}
