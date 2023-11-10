import _ from 'lodash';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import {
  GameArea,
  GameMove,
  GameMoveCommand,
  GameState,
  WinnableGameState,
} from '../../types/CoveyTownSocket';

export interface CovDocsGameState extends GameState {
  content: string;
}

export type CovDocsEvents = GameEventTypes & {
  docUpdated: (newContent: string) => void;
};

export type CovDocsOverwriteMove = { content: string };
export type CovDocsValidateUser = { id: CovDocUserID };
export type CovDocsCreateNewUser = { username: CovDocUserID; password: CovDocUserID };
export type CovDocsCreateNewDoc = { id: CovDocUserID };
export type CovDocsGetOwnedDocs = { id: CovDocUserID };
export type CovDocsOpenDoc = { id: CovDocDocID };
export type CovDocsCloseDoc = { id: CovDocDocID };
// some of these can have InteractableCommandReponse as a return from backend?

export type CovDocDocID = string;
export type CovDocUserID = string;

/**
 * A very state machine class. Could it be refactored through advanced design patterns?
 * What if we don't store the signed in user and the opened document here.
 */
export default class CovDocsAreaController extends GameAreaController<
  CovDocsGameState,
  CovDocsEvents
> {
  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }

  protected _updateFrom(newModel: GameArea<CovDocsGameState>): void {
    super._updateFrom(newModel);
    // this next line could be a thing
    // this.emit('docModified', newDoc);
  }

  // Sends a request to server to overwrite document
  public async writeToDoc(newDoc: CovDocDocID) {
    const response = await this._townController.sendInteractableCommand<
      GameMoveCommand<CovDocsOverwriteMove>
    >(this.id, {
      type: 'GameMove',
      gameID: this.id,
      move: {
        content: newDoc,
      },
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
  // TODO: create type for user ids
  // TODO: what if this returned a ValidatedCBoardAreaController
  // which contains methods only available to validated users?
  async validatePastUser(user_id: CovDocDocID, password: CovDocDocID): boolean {
    return false;
  }

  /**
   * Creates a new user with the given user name or password.
   * Throws exception if the user name is already taken.
   * @param user_id
   * @param password
   */
  async createNewUser(user_id: CovDocDocID, password: CovDocDocID) {}

  /**
   * Creates a new document in the document directory, returning
   * the new id.
   * Throws exception if not signed in.
   * @returns
   */
  // TODO: make custom type for doc_id
  async addNewDocument(): Promise<CovDocDocID> {
    return '';
  }

  /**
   * Loads the given document as the 'loaded document'.
   * @param id
   */
  async openDocument(id: CovDocDocID) {
    return;
  }

  /**
   * Returns the contents of the loaded document.
   * Throws exception if nothing loaded.
   * @returns
   */
  async getOpenedDocument(): Promise<string> {
    return '';
  }

  /**
   * Closes the loaded document. Throws exception if nothing loaded.
   * @returns
   */
  async closeDocument() {
    return;
  }

  async getOwnedDocs(id: CovDocUserID): Promise<CovDocDocID[]> {
    return [];
  }
}
