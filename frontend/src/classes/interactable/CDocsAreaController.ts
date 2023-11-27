import {
  CDocDocID,
  CDocUserID,
  CDocWriteDocCommand,
  CDocOpenDocCommand,
  CDocCreateNewDocCommand,
  CDocCreateNewUserCommand,
  GameInstanceID,
  ICDocArea,
  InteractableID,
  CDocCloseDocCommand,
  ICDocDocument,
  CDocGetDocCommand,
  CDocPassword,
  CDocGetOwnedDocsCommand,
  CDocValidateUserCommand,
  PermissionType,
  CDocShareDocCommand,
  CDocRemoveUserCommand,
  CDocGetSharedWithMe,
  ExtendedPermissionType,
} from '../../types/CoveyTownSocket';

import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import TownController from '../TownController';
import CDocUserDataMap from './CDocUserDataMap';

//TODO:
//idea : add a parameter on document that is permissionsOpen? that is a state variable. that way the controller
//can control toggling between the permissions and the document editing ui? first see how the current implementation goes and how it
//works to determine if this is a worthwhile change

/**
 * The events that a CDocsAreaController can emit
 */
export type CovDocsEvents = BaseInteractableEventMap & {
  docOpened: (docID: CDocDocID) => void;
  docClosed: () => void;
  docUpdated: (doc: ICDocDocument) => void;
  newUserRegistered: (user_id: CDocUserID) => void;
  // sends the id of the new document created, and if it is valid
  // it isn't valid if we don't know which is the newly created document
  newDocumentCreated: (docid: CDocDocID, valid_id: boolean) => void;
  sharedWithMeChanged: (docID: CDocDocID, permissionType: ExtendedPermissionType) => void;
  //add one for active users changed and add a field for active users in board area?
};

/**
export type CovDocsOverwriteMove = { content: string };
export type CovDocsValidateUser = { id: CovDocUserID };
export type CovDocsCreateNewUser = { username: CovDocUserID; password: CovDocUserID };
export type CovDocsCreateNewDoc = { id: CovDocUserID };
export type CovDocsGetOwnedDocs = { id: CovDocUserID };
export type CovDocsOpenDoc = { id: CovDocDocID };
export type CovDocsCloseDoc = { id: CovDocDocID };
// some of these can have InteractableCommandReponse as a return from backend?
**/

/**
 * A very state machine class. Could it be refactored through advanced design patterns?
 * What if we don't store the signed in user and the opened document here.
 */
export default class CDocsAreaController extends InteractableAreaController<
  CovDocsEvents,
  ICDocArea
> {
  protected _instanceID?: GameInstanceID; //is this necessary? how to dissacociate this from games

  private _townController: TownController;

  // a cached state to fire the appropriate update events
  private _boardArea: ICDocArea;

  private _userDataMap: CDocUserDataMap;

  private _userID: string | undefined;

  /**
   * Constructs a new BoardAreaController, initialized with the state of the
   * provided boardAreaModel.
   *
   * @param boardAreaModel The board area model that this controller should represent
   */
  constructor(id: InteractableID, boardAreaModel: ICDocArea, townController: TownController) {
    // super(boardAreaModel.id);
    super(id);
    this._boardArea = boardAreaModel;
    this._userDataMap = CDocUserDataMap.fromData(boardAreaModel.docMap);
    this._townController = townController;
  }

  /**
   * Doesn't need to do anything, see TownController
   * @returns true
   */
  public isActive(): boolean {
    return true;
  }

  // Sends a request to server to overwrite document
  public async writeToDoc(docid: CDocDocID, newDoc: string) {
    await this._townController.sendInteractableCommand<CDocWriteDocCommand>(this.id, {
      //add docId param to this command type?
      type: 'WriteDoc',
      content: newDoc,
      docid: docid,
    });
  }

  /**
   * Returns true if the user id and password match an existing user,
   * or false if they don't. If they match, the controller switches to
   * signed in mode, allowing more methods to be called such as adding documents.
   * @param user_id
   * @param password
   * @returns
   */
  // TODO: what if this returned a ValidatedCBoardAreaController
  // which contains methods only available to validated users?
  //does this need to be async?
  async isARegisteredUser(user_id: CDocUserID): Promise<boolean> {
    const isRegistered =
      this._boardArea.allRegisteredUsers.find(user => user === user_id) !== undefined;
    return isRegistered;
  }

  /**
   * Tries to sign in the user. If successful, this controller now belongs to that user.
   * @param userID
   * @param password
   * @returns
   */
  async signInUser(userID: CDocUserID, password: CDocPassword): Promise<boolean> {
    const { validation } =
      await this._townController.sendInteractableCommand<CDocValidateUserCommand>(this.id, {
        type: 'ValidateUser',
        id: userID,
        password: password,
      });

    if (validation) this._userID = userID;

    return validation as boolean;
  }

  /**
   * Creates a new user with the given user name or password.
   * Throws exception if the user name is already taken.
   * @param user_id
   * @param password
   */
  async createNewUser(user_id: CDocUserID, password: CDocPassword) {
    await this._townController.sendInteractableCommand<CDocCreateNewUserCommand>(this.id, {
      type: 'CreateNewUser',
      username: user_id,
      password: password,
    });
  }

  /**
   * Creates a new document in the document directory, returning
   * the new id.
   * Throws exception if not signed in.
   * @returns
   */
  async addNewDocument(user_id: CDocUserID): Promise<CDocDocID> {
    const { doc } = await this._townController.sendInteractableCommand<CDocCreateNewDocCommand>(
      this.id,
      {
        type: 'CreateNewDoc',
        id: user_id,
      },
    );
    this.emit('newDocumentCreated', (doc as ICDocDocument).docID, true);
    return (doc as ICDocDocument).docID;
  }

  /**
   * Loads the given document as the 'loaded document'.
   * @param doc_id
   */
  //does this need to return anything?
  async openDocument(userid: CDocUserID, doc_id: CDocDocID) {
    await this._townController.sendInteractableCommand<CDocOpenDocCommand>(this.id, {
      type: 'OpenDoc',
      docid: doc_id,
      userid: userid,
    });
    return;
  }

  /**
   * Returns the contents of the loaded document.
   * Throws exception if nothing loaded.
   * @returns
   */
  //what is this method used for?
  public async getOpenedDocument(user_id: CDocUserID): Promise<string> {
    if (user_id === undefined) throw new Error('Given null user_id in getOpenedDocument');
    if (this._userDataMap.hasActiveDoc(user_id))
      return (await this.getDocByID(this._userDataMap.getActiveDoc(user_id))).content;
    else throw new Error('No active document');
  }

  /**
   * TODO: make a choice between this method and the state machine getOpenedDocument, or use both
   * @param id
   * @returns
   */
  public async getDocByID(id: CDocDocID): Promise<ICDocDocument> {
    const { doc } = await this._townController.sendInteractableCommand<CDocGetDocCommand>(this.id, {
      type: 'GetDoc',
      docid: id,
    });
    return doc as ICDocDocument;
  }

  /**
   * Closes the loaded document. Throws exception if nothing loaded.
   */
  async closeDocument(doc_id: CDocDocID) {
    await this._townController.sendInteractableCommand<CDocCloseDocCommand>(this.id, {
      type: 'CloseDoc',
      id: doc_id,
    });
  }

  //what is this method used for?
  async getOwnedDocs(id: CDocUserID): Promise<CDocDocID[]> {
    const { docs } = await this._townController.sendInteractableCommand<CDocGetOwnedDocsCommand>(
      this.id,
      {
        type: 'GetOwnedDocs',
        id: id,
      },
    );
    return docs as CDocDocID[];
  }

  public async shareDocWith(docID: CDocDocID, userID: CDocUserID, permissionType: PermissionType) {
    await this._townController.sendInteractableCommand<CDocShareDocCommand>(this.id, {
      docID,
      targetUser: userID,
      permissionType,
      type: 'ShareDoc',
    });
  }

  public async removeUserFrom(docID: CDocDocID, userID: CDocUserID) {
    await this._townController.sendInteractableCommand<CDocRemoveUserCommand>(this.id, {
      type: 'RemoveUser',
      docID: docID,
      targetUser: userID,
    });
  }

  public async getDocsSharedWith(
    userID: CDocUserID,
    permissionType: PermissionType,
  ): Promise<CDocDocID[]> {
    const { docs } = await this._townController.sendInteractableCommand<CDocGetSharedWithMe>(
      this.id,
      {
        type: 'GetSharedWithMe',
        userID: userID,
        permissionType: permissionType,
      },
    );

    return docs as CDocDocID[];
  }

  /**
   * @returns BoardAreaModel that represents the current state of this BoardAreaController
   */
  public toInteractableAreaModel(): ICDocArea {
    return this._boardArea;
  }

  /**
   * Applies updates to this boardAreaController's model, setting the relevant fields
   * from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: ICDocArea): void {
    const oldBoard = this._boardArea;
    const oldMap = this._userDataMap;
    this._boardArea = updatedModel;
    this._userDataMap = CDocUserDataMap.fromData(updatedModel.docMap);

    if (oldBoard.allRegisteredUsers !== this._boardArea.allRegisteredUsers) {
      this.emit(
        'newUserRegistered',
        updatedModel.allRegisteredUsers[updatedModel.allRegisteredUsers.length - 1],
      );
    }

    if (this._userID !== undefined) {
      const hadOpenDoc = oldMap.hasActiveDoc(this._userID);
      const hasOpenDoc = this._userDataMap.hasActiveDoc(this._userID);

      //add emit statements for ui
      if (!hadOpenDoc && hasOpenDoc) {
        this.emit('docOpened', this._userDataMap.getActiveDoc(this._userID));
      } else if (
        hadOpenDoc &&
        hasOpenDoc &&
        oldMap.getActiveDoc(this._userID) !== this._userDataMap.getActiveDoc(this._userID)
      ) {
        this.emit('docOpened', this._userDataMap.getActiveDoc(this._userID));
      } else if (
        hadOpenDoc &&
        hasOpenDoc &&
        oldMap.getActiveDoc(this._userID) === this._userDataMap.getActiveDoc(this._userID)
      ) {
        this._sendDocUpdated(
          oldMap.getActiveDoc(this._userID),
          this._userDataMap.getActiveDoc(this._userID),
        );
      } else if (hadOpenDoc && !hasOpenDoc) {
        this.emit('docClosed');
      }

      const prevOwnedDocs = oldMap.getOwnedDocs(this._userID);
      const newOwnedDocs = this._userDataMap.getOwnedDocs(this._userID);

      // TODO: this is brittle, what about doc deletion?
      if (newOwnedDocs.length > prevOwnedDocs.length) {
        this.emit('newDocumentCreated', 'unknown_id', false);
      }

      const pTypes: PermissionType[] = ['EDIT', 'VIEW'];

      for (const pType of pTypes) {
        const prevShared = oldMap.getSharedDocs(this._userID, pType);
        const newShared = this._userDataMap.getSharedDocs(this._userID, pType);

        const added = newShared.filter(doc => prevShared.indexOf(doc) < 0);
        const removed = prevShared.filter(doc => newShared.indexOf(doc) < 0);

        for (const addDoc of added) this.emit('sharedWithMeChanged', addDoc, pType);
        for (const removeDoc of removed) this.emit('sharedWithMeChanged', removeDoc, 'REMOVE');
      }
    }
  }

  private async _sendDocUpdated(oldID: CDocDocID, docID: CDocDocID) {
    const oldDoc = this.getDocByID(oldID);
    const newDoc = this.getDocByID(docID);

    const docs = await Promise.all([oldDoc, newDoc]);

    this.emit('docUpdated', docs[1]);
  }
}
