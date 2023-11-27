import { nanoid } from 'nanoid';
import {
  CDocDocID,
  CDocUserID,
  ExtendedPermissionType,
  ICDocDocument,
  PermissionType,
} from '../types/CoveyTownSocket';
import { ICDocServer } from './ICDocServer';
import Documents from '../api/document';
import appDataSource from '../api/datasource';
import Users from '../api/user';

// TODO: change ids from numbers to right typegit
/** We will do all operations directly to database for now. */
export default class CDocServer implements ICDocServer {
  private static _instance: CDocServer;

  private _listeners: ((docid: CDocDocID) => void)[];

  private _shareDocListeners: ((
    docid: CDocDocID,
    targetUser: CDocUserID,
    permissionType: ExtendedPermissionType,
  ) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
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

  public static getInstance(): CDocServer {
    if (!CDocServer._instance) {
      CDocServer._instance = new CDocServer();
    }

    return CDocServer._instance;
  }

  public async createNewDoc(user_id: string): Promise<ICDocDocument> {
    const newDoc: Documents = new Documents();

    newDoc.user_id = user_id;
    newDoc.name = 'New Document';
    newDoc.allowedusersview = [];
    newDoc.allowedusersedit = [];
    newDoc.data = 'this is a default doc';
    newDoc.id = nanoid();

    const newID = await appDataSource
      .createQueryBuilder()
      .insert()
      .into(Documents)
      .values([newDoc])
      .returning('id')
      .execute();
    return this.getDoc(newID.generatedMaps[0].id);
  }

  public async createNewUser(username: string, password: string) {
    //  const users = await appDataSource
    // .createQueryBuilder()
    // .select('user')
    // .from(User, 'user')
    // .where('user.id = :id', { username })
    // .getMany();

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
    const document = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Documents, 'doc')
      .where('doc.id = :id', { id: docid })
      .getOne();

    if (document === null) {
      throw new Error('Document not found');
    } else {
      const doc: ICDocDocument = {
        owner: document.user_id,
        editors: document.allowedusersedit,
        viewers: document.allowedusersview,
        content: document.data,
        createdAt: 'Missing in database',
        docID: document.id,
        docName: document.name,
      };
      return doc;
    }
  }
}
