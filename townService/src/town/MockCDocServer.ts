import { nanoid } from 'nanoid';
import appDataSource from '../api/datasource';
import Documents from '../api/document';
import Users from '../api/user';
import {
  CDocDocID,
  CDocUserID,
  ExtendedPermissionType,
  PermissionType,
  ICDocDocument,
} from '../types/CoveyTownSocket';
import CDocServer from './CDocServer';

export default class MockCDocServer {
  public static _instance: CDocServer;

  public _listeners: ((docid: CDocDocID) => void)[];

  public _shareDocListeners: ((
    docid: CDocDocID,
    targetUser: CDocUserID,
    permissionType: ExtendedPermissionType,
  ) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor() {
    this._listeners = [];
    this._shareDocListeners = [];
  }

  public addSharedWithListener(
    listener: (
      docid: CDocDocID,
      targetUser: CDocUserID,
      permissionType: ExtendedPermissionType,
    ) => void,
  ): void {
    this._shareDocListeners.push(listener);
  }

  public removeSharedWithListener(
    listener: (
      docid: CDocDocID,
      targetUser: CDocUserID,
      permissionType: ExtendedPermissionType,
    ) => void,
  ): void {
    this._shareDocListeners = this._shareDocListeners.filter(l => l !== listener);
  }

  public getSharedWith(userID: string, permissionType: PermissionType): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  public async shareDocumentWith(
    docID: string,
    userID: string,
    permissionType: PermissionType,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async removeUserFrom(docID: string, userID: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async validateUser(id: string, password: string): Promise<boolean> {
    const foundUsers = await appDataSource
      .createQueryBuilder()
      .select('user')
      .from(Users, 'user')
      .where('user.id = :id', { id })
      .andWhere('user.password = :password', { password })
      .getMany();
    return foundUsers.length === 1;
  }

  public addDocumentEditedListener(listener: (docid: string) => void): void {
    this._listeners.push(listener);
  }

  public removeDocumentEditedListener(listener: (docid: string) => void): void {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  //   public static getInstance(): CDocServer {
  //     if (!CDocServer._instance) {
  //       CDocServer._instance = new CDocServer();
  //     }

  //     return CDocServer._instance;
  //   }

  public async createNewDoc(user_id: string): Promise<ICDocDocument> {
    const newDoc: Documents = new Documents();

    newDoc.user_id = user_id;
    newDoc.name = 'New Document';
    newDoc.allowedusersview = [];
    newDoc.allowedusersedit = [];
    newDoc.data = 'this is a default doc';
    newDoc.id = nanoid();

    return this.getDoc('fakeID');
  }

  public async createNewUser(username: string, password: string) {
    const foundUsers = await appDataSource.manager.find(Users, { where: { id: username } });
    if (foundUsers.length !== 0) throw new Error('User already exists');

    if (username === undefined || password === undefined)
      throw new Error('Username or password was null');
    const newUser: Users = new Users();
    newUser.id = username;
    newUser.username = username;
    newUser.password = password;
    await appDataSource.createQueryBuilder().insert().into(Users).values([newUser]).execute();
  }

  public async getOwnedDocs(docid: CDocDocID): Promise<CDocDocID[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Documents, 'doc')
      .where('doc.id = :id', { id: docid })
      .getMany();
    return docs.map(doc => String(doc.name));
  }

  public async writeToDoc(docid: CDocDocID, content: string) {
    await appDataSource
      .createQueryBuilder()
      .update(Documents)
      .set({ data: content })
      .where('id = :id', { id: docid })
      .execute();
    this._listeners.map(listener => listener(docid));
  }

  public async getDoc(docid: CDocDocID): Promise<ICDocDocument> {
    const doc: ICDocDocument = {
      owner: 'mock owner',
      editors: [],
      viewers: [],
      content: 'mock content',
      createdAt: 'Missing in database',
      docID: docid,
      docName: 'mock name',
    };

    return doc;
  }
}
