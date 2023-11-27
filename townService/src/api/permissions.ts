import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CDocDocID, CDocUserID } from '../types/CoveyTownSocket';

@Entity()
export default class Permissions {
  @Column()
  permissionType: string;

  @Column()
  userID: CDocUserID;

  @Column()
  docID: CDocDocID;

  @PrimaryGeneratedColumn()
  id: number;
}
