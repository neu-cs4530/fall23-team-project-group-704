import { CDocDocID, ICDocDocument } from '../types/CoveyTownSocket';
import { ICDocServer } from './ICDocServer';
import Document from '../api/document';
import appDataSource from '../api/datasource';

// TODO: change ids from numbers to right type
/** We will do all operations directly to database for now. */
export default class CDocServer implements ICDocServer {
  private static _instance: CDocServer;

  private _listeners: ((docid: CDocDocID) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

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

  async createNewDoc(user_id: string): Promise<ICDocDocument> {
    const newDoc: Document = {
      id: 'invalid',
      userId: user_id,
      name: 'Default Doc',
      allowedUsersView: [],
      allowedUsersEdit: [],
      data: 'this is a default doc',
      uploaded_data: [],
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

  validateUser(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async createNewUser(username: string, password: string) {
    throw new Error('Method not implemented.');
  }

  async getOwnedDocs(docid: CDocDocID): Promise<CDocDocID[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Document, 'doc')
      .where('doc.id = :id', { id: docid })
      .getMany();
    return docs.map(doc => String(doc.id));
  }

  public loadIfNotLoaded(docid: CDocDocID) {
    throw new Error('Not implemented');
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
        createdBy: document.userId,
        owner: '',
        boardID: String(document.id),
        boardName: document.id,
        editors: document.allowedUsersEdit,
        viewers: document.allowedUsersView,
        content: document.data,
      };
      return doc;
    }
  }
}
