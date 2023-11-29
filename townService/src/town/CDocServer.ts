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
import Permissions from '../api/permissions';

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

  private _userCreatedListeners: ((userID: CDocUserID) => void)[];

  private constructor() {
    this._listeners = [];
    this._shareDocListeners = [];
    this._userCreatedListeners = [];
    // this._debugDeleteAll();
  }

  private async _debugDeleteAll() {
    await appDataSource
      .createQueryBuilder()
      .delete()
      .from(Documents)
      .where('user_id = :userID', { userID: 'Ise' })
      .execute();
  }

  addNewUserRegisteredListener(listener: (userID: string) => void): void {
    this._userCreatedListeners.push(listener);
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

  public async getSharedWith(userID: string, permissionType: PermissionType): Promise<string[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('perm')
      .from(Permissions, 'perm')
      .where('perm.userID = :userID', { userID })
      .andWhere('perm.permissionType = :permissionType', { permissionType })
      .getMany();

    return docs.map(perm => perm.docID);
  }

  // Only does something if the document is not shared with this person, else fails
  public async shareDocumentWith(
    docID: string,
    userID: string,
    permissionType: PermissionType,
  ): Promise<void> {
    const perms = await appDataSource.manager.find(Permissions, {
      where: { userID, docID },
    });

    if (perms.length !== 0)
      throw new Error('User already has permissions on doc, remove them first');

    const foundUsers = await appDataSource.manager.find(Users, { where: { id: userID } });
    if (foundUsers.length === 0) throw new Error('User does not exist');

    const perm: Permissions = new Permissions();
    perm.docID = docID;
    perm.userID = userID;
    perm.permissionType = permissionType;

    await appDataSource.createQueryBuilder().insert().into(Permissions).values([perm]).execute();

    this._shareDocListeners.map(listener => listener(docID, userID, permissionType));
  }

  public async removeUserFrom(docID: string, userID: string): Promise<void> {
    await appDataSource
      .createQueryBuilder()
      .delete()
      .from(Permissions)
      .where('docID = :docID', { docID })
      .andWhere('userID = :userID', { userID })
      .execute();

    this._shareDocListeners.map(listener => listener(docID, userID, 'REMOVE'));
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

  public async getOwnedDocs(userID: CDocUserID): Promise<CDocDocID[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Documents, 'doc')
      .where('doc.user_id = :userID', { userID })
      .getMany();

    // await appDataSource
    // .createQueryBuilder()
    // .delete()
    // .from(Documents)
    // .where('user_id = :userID', { userID: 'Ise' })
    // .execute();
    return docs.map(doc => doc.id);
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
        editors: await this._getCollaboratorsFor(docid, 'EDIT'),
        viewers: await this._getCollaboratorsFor(docid, 'VIEW'),
        content: document.data,
        createdAt: document.date.toISOString(),
        docID: document.id,
        docName: document.name,
      };
      return doc;
    }
  }

  public async getAllRegisteredUsers(): Promise<CDocUserID[]> {
    const foundUsers = await appDataSource.manager.find(Users, { where: {} });
    return foundUsers.map(user => user.id);
  }

  private _addIfNotThere<Type>(list: Type[], item: Type): Type[] {
    if (list.find(elem => elem === item) !== undefined) return list;
    return list.concat([item]);
  }

  private async _getCollaboratorsFor(docID: CDocDocID, permissionType: PermissionType) {
    const collaborators = await appDataSource
      .createQueryBuilder()
      .select('perm')
      .from(Permissions, 'perm')
      .where('perm.docID = :docID', { docID })
      .andWhere('perm.permissionType = :permissionType', { permissionType })
      .getMany();

    return collaborators.map(perm => perm.userID);
  }
}
