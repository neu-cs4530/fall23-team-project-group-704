import { nanoid } from 'nanoid';
import {
  CDocDocID,
  CDocPassword,
  CDocUserID,
  ExtendedPermissionType,
  ICDocDocument,
  PermissionType,
} from '../types/CoveyTownSocket';

/**
 * Interface for database wrapper.
 */
export interface ICDocServer {
  /**
   * Creates a new document in the database with the given user as owner, and returns it.
   * @param id
   */
  createNewDoc(id: string): Promise<ICDocDocument>;

  /**
   * Checks if the given user and password combo is valid.
   * @param id
   * @param password
   */
  validateUser(id: string, password: CDocPassword): Promise<boolean>;

  /**
   * Creates a new user with given username and password, or throws
   * error if the username is already taken.
   * @param username
   * @param password
   */
  createNewUser(username: string, password: string): Promise<void>;

  /**
   * Gets all owned documents for the given user, or none if they don't exist.
   * @param id
   */
  getOwnedDocs(id: string): Promise<CDocDocID[]>;

  /**
   * Returns the given document, or throws error if the doc doesn't exist.
   * @param docid
   */
  getDoc(docid: string): Promise<ICDocDocument>;

  /**
   * Overwrites the content of the specified doc, if it exists.
   * @param docid
   * @param content
   */
  writeToDoc(docid: string, content: string): Promise<void>;

  /**
   * Add a listener for the document edited event.
   * @param listener
   */
  addDocumentEditedListener(listener: (docid: CDocDocID) => void): void;

  /**
   * Remove a listener from the document edited event.
   * @param listener
   */
  removeDocumentEditedListener(listener: (docid: CDocDocID) => void): void;

  /**
   * Add a listener for the "doc shared with someone" event.
   * @param listener
   */
  addSharedWithListener(
    listener: (
      docid: CDocDocID,
      targetUser: CDocUserID,
      permissionType: ExtendedPermissionType,
    ) => void,
  ): void;

  /**
   * Remove a listener from the "doc shared with someone" event.
   * @param listener
   */
  removeSharedWithListener(
    listener: (
      docid: CDocDocID,
      targetUser: CDocUserID,
      permissionType: ExtendedPermissionType,
    ) => void,
  ): void;

  /**
   * Share the given document with the given user for given permission type.
   * If there is no permission data regarding the specified user and file, throws error.
   * If the user does not exist, throws error.
   * @param docID
   * @param userID
   * @param permissionType
   */
  shareDocumentWith(
    docID: CDocDocID,
    userID: CDocUserID,
    permissionType: PermissionType,
  ): Promise<void>;

  /**
   * Removes the given user from the document.
   * @param docID
   * @param userID
   */
  removeUserFrom(docID: CDocDocID, userID: CDocDocID): Promise<void>;

  /**
   * Gets all documents shared with a person, returning empty array if they don't exist or nothing is shared with them.
   * @param userID
   * @param permissionType
   */
  getSharedWith(userID: CDocUserID, permissionType: PermissionType): Promise<CDocDocID[]>;
}

export class MockCDocServer implements ICDocServer {
  private static _instance: MockCDocServer;

  private _mockOwnedDocs: ICDocDocument[];

  private _users: [CDocUserID, CDocPassword][];

  private _listeners: ((docid: CDocDocID) => void)[];

  private _shareDocListeners: ((
    docid: CDocDocID,
    targetUser: CDocUserID,
    permissionType: ExtendedPermissionType,
  ) => void)[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this._mockOwnedDocs = [];
    this._users = [];
    this._listeners = [];
    this._shareDocListeners = [];
  }

  addSharedWithListener(
    listener: (docid: string, targetUser: string, permissionType: ExtendedPermissionType) => void,
  ): void {
    this._shareDocListeners.push(listener);
  }

  removeSharedWithListener(
    listener: (docid: string, targetUser: string, permissionType: ExtendedPermissionType) => void,
  ): void {
    this._shareDocListeners = this._shareDocListeners.filter(l => l !== listener);
  }

  public async getSharedWith(userID: string, permissionType: PermissionType): Promise<string[]> {
    let pred = (doc: ICDocDocument) => {};

    if (permissionType === 'EDIT') {
      pred = (doc: ICDocDocument) => doc.editors.find(editor => editor === userID) !== undefined;
    } else if (permissionType === 'VIEW') {
      pred = (doc: ICDocDocument) => doc.viewers.find(viewer => viewer === userID) !== undefined;
    }
    return this._mockOwnedDocs.filter(pred).map(doc => doc.docID);
  }

  public async shareDocumentWith(
    docID: string,
    userID: string,
    permissionType: PermissionType,
  ): Promise<void> {
    const i = this._mockOwnedDocs.findIndex(doc => doc.docID === docID);

    if (i === -1) throw new Error('Tried to share non existent doc');

    const oldDoc = this._mockOwnedDocs[i];

    const newDoc: ICDocDocument = {
      createdAt: oldDoc.createdAt,
      owner: oldDoc.owner,
      docID: oldDoc.docID,
      docName: oldDoc.docName,
      editors: oldDoc.editors.concat(permissionType === 'EDIT' ? [userID] : []),
      viewers: oldDoc.viewers.concat(permissionType === 'VIEW' ? [userID] : []),
      content: oldDoc.content,
    };
    this._mockOwnedDocs[i] = newDoc;
    this._listeners.map(listener => listener(docID));
  }

  public async removeUserFrom(docID: string, userID: string): Promise<void> {
    const i = this._mockOwnedDocs.findIndex(doc => doc.docID === docID);

    if (i === -1) throw new Error('Tried to operate non existent doc');

    const oldDoc = this._mockOwnedDocs[i];

    const newDoc: ICDocDocument = {
      createdAt: oldDoc.createdAt,
      owner: oldDoc.owner,
      docID: oldDoc.docID,
      docName: oldDoc.docName,
      editors: oldDoc.editors.filter(user => user !== userID),
      viewers: oldDoc.viewers.filter(user => user !== userID),
      content: oldDoc.content,
    };
    this._mockOwnedDocs[i] = newDoc;
    this._listeners.map(listener => listener(docID));
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
      createdAt: new Date().toLocaleString(),
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
