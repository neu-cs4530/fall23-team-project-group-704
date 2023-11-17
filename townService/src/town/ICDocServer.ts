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
      createdBy: id,
      owner: id,
      boardID: nanoid(),
      boardName: 'DefaultDoc',
      editors: [],
      viewers: [],
      content: 'this is a freshly created new doc',
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
    return this._mockOwnedDocs.filter(doc => doc.owner === id).map(doc => doc.boardID);
  }

  async getDoc(docid: string): Promise<ICDocDocument> {
    const foundDoc = this._mockOwnedDocs.find(doc => doc.boardID === docid);

    if (foundDoc) return foundDoc;
    throw new Error('Doc not found');
  }

  async writeToDoc(docid: string, content: string): Promise<void> {
    const doc = await this.getDoc(docid);
    doc.content = content;
    this._listeners.map(listener => listener(docid));
  }
}
