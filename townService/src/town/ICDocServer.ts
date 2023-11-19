import { nanoid } from 'nanoid';
import { CDocDocID, CDocPassword, CDocUserID, ICDocDocument } from '../types/CoveyTownSocket';

export interface ICDocServer {
  createNewDoc(id: string): Promise<ICDocDocument>;
  validateUser(id: string, password: CDocPassword): Promise<boolean>;
  createNewUser(username: string, password: string): Promise<void>;
  getOwnedDocs(id: string): Promise<CDocDocID[]>;
  getDoc(docid: string): Promise<ICDocDocument>;
  writeToDoc(docid: string, content: string): Promise<void>;
}

export class MockCDocServer implements ICDocServer {
  private _mockOwnedDocs: ICDocDocument[];

  private _users: [CDocUserID, CDocPassword][];

  constructor() {
    this._mockOwnedDocs = [];
    this._users = [];
  }

  async createNewDoc(id: string): Promise<ICDocDocument> {
    const i = this._mockOwnedDocs.push({
      owner: id,
      editors: [],
      viewers: [],
      content: 'this is a freshly created new doc',
      createdAt: undefined,
      docID: nanoid(),
      docName: 'Default name',
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
    const foundDoc = this._mockOwnedDocs.find(doc => doc.docID === docid);

    if (foundDoc) return foundDoc;
    throw new Error('Doc not found');
  }

  async writeToDoc(docid: string, content: string): Promise<void> {
    const doc = await this.getDoc(docid);
    doc.content = content;
  }
}
