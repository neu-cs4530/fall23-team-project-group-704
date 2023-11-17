import { nanoid } from 'nanoid';
import { listenerCount } from 'process';
import { CDocDocID, CDocPassword, CDocUserID, ICDocDocument } from '../types/CoveyTownSocket';

export interface ICDocServer {
  createNewDoc(id: string): Promise<ICDocDocument>;
  validateUser(id: string, password: CDocPassword): Promise<boolean>;
  createNewUser(username: string, password: string): Promise<void>;
  getOwnedDocs(id: string): Promise<CDocDocID[]>;
  getDoc(docid: string): Promise<ICDocDocument>;
  writeToDoc(docid: string, content: string): Promise<void>;

  addDocumentEditedListener(listener: (docid: CDocDocID) => void): void;
  removeDocumentEditedListener(listener: (docid: CDocDocID) => void): void;
}

export class MockCDocServer implements ICDocServer {
  private static _instance: MockCDocServer;

  private _mockOwnedDocs: ICDocDocument[];

  private _users: [CDocUserID, CDocPassword][];

  private _listeners: ((docid: CDocDocID) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this._mockOwnedDocs = [];
    this._users = [];
    this._listeners = [];
  }

  public addDocumentEditedListener(listener: (docid: string) => void): void {
    this._listeners.push(listener);
  }

  public removeDocumentEditedListener(listener: (docid: string) => void): void {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  public documentEdited: (docid: string) => void;

  public static getInstance(): MockCDocServer {
    if (!MockCDocServer._instance) {
      MockCDocServer._instance = new MockCDocServer();
    }

    return MockCDocServer._instance;
  }

  async createNewDoc(id: string): Promise<ICDocDocument> {
    const i = this._mockOwnedDocs.push({
      owner: id,
      editors: [],
      viewers: [],
      content: 'this is default content from the mock backend',
      createdAt: 'some date',
      docID: nanoid(),
      docName: 'Default Backend Name',
    });
    return this._mockOwnedDocs[i - 1];
  }

  async validateUser(id: string, password: CDocPassword): Promise<boolean> {
    return this._users.find(user => user[0] === password) !== undefined;
  }

  async createNewUser(username: string, password: string): Promise<void> {
    if (this._users.find(user => user[0] === username) === undefined)
      this._users.push([username, password]);
    else throw new Error('User already exists');
  }

  async getOwnedDocs(id: string): Promise<string[]> {
    return this._mockOwnedDocs.filter(doc => doc.owner === id).map(doc => doc.docID);
  }

  async getDoc(docid: string): Promise<ICDocDocument> {
    if (docid === undefined) throw new Error('doc id is udnefined');
    const foundDoc = this._mockOwnedDocs.find(doc => doc.docID === docid);

    if (foundDoc) return foundDoc;
    throw new Error(`doc not found: ${docid}`);
  }

  async writeToDoc(docid: string, content: string): Promise<void> {
    const i = this._mockOwnedDocs.findIndex(doc => doc.docID === docid);

    if (i === -1) throw new Error('Tried to write to non existent doc');
    this._mockOwnedDocs[i] = this._changeDocContent(this._mockOwnedDocs[i], content);
    this._listeners.map(listener => listener(docid));
  }

  private _changeDocContent(doc: ICDocDocument, content: string): ICDocDocument {
    const newDoc: ICDocDocument = {
      createdAt: doc.createdAt,
      owner: doc.owner,
      docID: doc.docID,
      docName: doc.docName,
      editors: doc.editors,
      viewers: doc.viewers,
      content,
    };
    return newDoc;
  }
}
