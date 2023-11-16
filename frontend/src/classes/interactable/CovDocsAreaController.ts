import _ from 'lodash';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import {
  CDocDocID,
  CDocUserID,
  CDocWriteDocCommand,
  CDocOpenDocCommand,
  CDocCreateNewDocCommand,
  CDocCreateNewUserCommand,
  GameArea,
  GameInstanceID,
  GameMove,
  GameMoveCommand,
  GameState,
  ICDocArea,
  InteractableID,
  PlayerID,
  WinnableGameState,
  CDocCloseDocCommand,
} from '../../types/CoveyTownSocket';

import { ICDocArea as BoardAreaModel } from '../../types/CoveyTownSocket';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import TownController from '../TownController';

/**
 * The events that a CovDocsAreaController can emit
 */
export type CovDocsEvents = BaseInteractableEventMap & {
  docOpened: () => void;
  docClosed: () => void;
  docUpdated: (newContent: string) => void;
  newUserRegistered: (user_id: CDocUserID) => void;
  userLoggedIn: (user_id: CDocUserID) => void
  newDocumentCreated: () => void
  userLoggedOut: (user_id: CDocUserID) => void
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
export default class CovDocsAreaController extends InteractableAreaController<
  CovDocsEvents,
  ICDocArea
> {
  protected _instanceID?: GameInstanceID; //is this necessary? how to dissacociate this from games

  private _townController: TownController;

  private _boardArea: BoardAreaModel;

  /**
   * Constructs a new BoardAreaController, initialized with the state of the
   * provided boardAreaModel.
   *
   * @param boardAreaModel The board area model that this controller should represent
   */
  constructor(id: InteractableID, boardAreaModel: BoardAreaModel, townController: TownController) {
    // super(boardAreaModel.id);
    super(id);
    this._boardArea = boardAreaModel;
    this._townController = townController;
  }

  //checks if their is an active document open
  public isActive(): boolean {
    return this._boardArea.activeDocument !== undefined;
  }

  // Sends a request to server to overwrite document
  public async writeToDoc(newDoc: string) {
    await this._townController.sendInteractableCommand<CDocWriteDocCommand>(this.id, {
      //add docId param to this command type?
      type: 'WriteDoc',
      content: newDoc,
      docid: newDoc,
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
    return this._boardArea.allRegisteredUsers.find(user => user === user_id) !== undefined;
  }

  /**
   * Creates a new user with the given user name or password.
   * Throws exception if the user name is already taken.
   * @param user_id
   * @param password
   */
  async createNewUser(user_id: CDocUserID) {
    await this._townController.sendInteractableCommand<CDocCreateNewUserCommand>(this.id, {
      type: 'CreateNewUser',
      username: user_id,
    });
  }

  /**
   * Creates a new document in the document directory, returning
   * the new id.
   * Throws exception if not signed in.
   * @returns
   */
  async addNewDocument(user_id: CDocUserID): Promise<CDocDocID> {
    await this._townController.sendInteractableCommand<CDocCreateNewDocCommand>(this.id, {
      type: 'CreateNewDoc',
      id: user_id,
    });
    return 'HOW TO GENERATE A UNIQUE ID EACH TIME?';
  }

  /**
   * Loads the given document as the 'loaded document'.
   * @param doc_id
   */
  //does this need to return anything?
  async openDocument(doc_id: CDocDocID) {
    await this._townController.sendInteractableCommand<CDocOpenDocCommand>(this.id, {
      type: 'OpenDoc',
      id: doc_id,
    });
    return;
  }

  /**
   * Returns the contents of the loaded document.
   * Throws exception if nothing loaded.
   * @returns
   */
  //what is this method used for?
  async getOpenedDocument(): Promise<string> {
    return '';
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
    return [];
  }

  /**
   * @returns BoardAreaModel that represents the current state of this BoardAreaController
   */
  public toInteractableAreaModel(): BoardAreaModel {
    return this._boardArea;
  }

  /**
   * Applies updates to this boardAreaController's model, setting the relevant fields
   * from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: BoardAreaModel): void {
    const oldBoard = this._boardArea.activeDocument;

    const aDocWasOpen = oldBoard ? true : false;

    const previousUsers = this._boardArea.allRegisteredUsers;

    this._boardArea = updatedModel;

    const newBoard = this._boardArea.activeDocument;

    const aDocNowOpen = newBoard ? true : false;

    const currentUsers = this._boardArea.allRegisteredUsers;

    //add emit statements for ui
    if (aDocWasOpen !== aDocNowOpen) {
      if (aDocNowOpen) {
        this.emit('docOpened');
      } else {
        this.emit('docClosed');
      }
    }

    if (aDocWasOpen) {
      if (oldBoard?.content !== newBoard?.content) {
        //need a different way to measure equality for boards?
        this.emit('docUpdated', newBoard?.content);
      }
    }

    if (previousUsers !== currentUsers) {
      this.emit(
        'newUserRegistered',
        updatedModel.allRegisteredUsers[updatedModel.allRegisteredUsers.length - 1],
      );
    }
  }
}
