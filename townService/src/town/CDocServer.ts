import { nanoid } from 'nanoid';
import { CDocDocID, ICDocDocument } from '../types/CoveyTownSocket';
import { ICDocServer } from './ICDocServer';
import Document from '../api/document';
import appDataSource from '../api/datasource';
import User from '../api/user';

// TODO: change ids from numbers to right type
/** We will do all operations directly to database for now. */
export default class CDocServer implements ICDocServer {
  private static _instance: CDocServer;

  private _listeners: ((docid: CDocDocID) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this._listeners = [];
  }

  public async validateUser(id: string, password: string): Promise<boolean> {
    const users = await appDataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.id = :id', { id })
      .andWhere('user.password = :password', { password })
      .getMany();
    return users.length === 1;
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
    const newDoc: Document = {
      id: nanoid(),
      userId: user_id,
      name: 'Default Doc',
      allowedUsersView: [],
      allowedUsersEdit: [],
      data: 'this is a default doc',
    };
    const newID = await appDataSource
      .createQueryBuilder()
      .insert()
      .into(Document)
      .values([newDoc])
      .returning('id')
      .execute();
    return this.getDoc(newID.generatedMaps[0].id);
  }

  public async createNewUser(username: string, password: string) {
    const users = await appDataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.id = :id', { username })
      .getMany();

    if (users.length !== 0) throw new Error('User already exists');

    const newUser: User = {
      id: username,
      userName: username,
      password,
    };
    await appDataSource.createQueryBuilder().insert().into(User).values([newUser]).execute();
  }

  public async getOwnedDocs(docid: CDocDocID): Promise<CDocDocID[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Document, 'doc')
      .where('doc.id = :id', { id: docid })
      .getMany();
    return docs.map(doc => String(doc.id));
  }

  public async writeToDoc(docid: CDocDocID, content: string) {
    await appDataSource
      .createQueryBuilder()
      .update(Document)
      .set({ data: content })
      .where('id = :id', { id: docid })
      .execute();
    this._listeners.map(listener => listener(docid));
  }

  public async getDoc(docid: CDocDocID): Promise<ICDocDocument> {
    const document = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Document, 'doc')
      .where('doc.id = :id', { id: docid })
      .getOne();

    if (document === null) {
      throw new Error();
    } else {
      const doc: ICDocDocument = {
        owner: document.userId,
        editors: document.allowedUsersEdit,
        viewers: document.allowedUsersView,
        content: document.data,
        createdAt: 'need to implement this',
        docID: document.id,
        docName: document.name,
      };
      return doc;
    }
  }
}
