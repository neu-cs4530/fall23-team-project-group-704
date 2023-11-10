import _ from 'lodash';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import {
  GameArea,
  GameInstanceID,
  GameMove,
  GameMoveCommand,
  GameState,
  InteractableID,
  PlayerID,
  WinnableGameState,
} from '../../types/CoveyTownSocket';
import { BoardAreaEvents } from './BoardAreaController';
import { BoardArea as BoardAreaModel } from '../../types/CoveyTownSocket';

import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import TownController from '../TownController';

export interface CovDocsGameState extends GameState {
  content: string;
}

/**
 * The events that a CovDocsAreaController can emit
 */
export type CovDocsEvents = BaseInteractableEventMap & {
  docUpdated: (newContent: string) => void;

  //examples from viewing area:
  /**
   * A progressChange event indicates that the progress of the video has changed, either
   * due to the user scrubbing through the video, or from the natural progression of time.
   * Listeners are passed the new playback time elapsed in seconds.
   */
  // progressChange: (elapsedTimeSec: number) => void;
  /**
   * A videoChange event indicates that the video selected for this viewing area has changed.
   * Listeners are passed the new video, which is either a string (the URL to a video), or
   * the value `undefined` to indicate that there is no video set.
   */
  // videoChange: (video: string | undefined) => void;
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
export default class CovDocsAreaController extends InteractableAreaController<BoardAreaEvents, BoardAreaModel> {
  
  protected _instanceID?: GameInstanceID;

  protected _townController: TownController;

  protected _allRegisteredUsers: PlayerID[];

  private _model: BoardAreaModel;

  

  /**
   * Constructs a new BoardAreaController, initialized with the state of the
   * provided boardAreaModel.
   *
   * @param boardAreaModel The board area model that this controller should represent
   */
  constructor(id: InteractableID, boardAreaModel: BoardAreaModel, townController: TownController) {
    // super(boardAreaModel.id);
     super(id);
     this._model = boardAreaModel;
     this._townController = townController;
     this._allRegisteredUsers = boardAreaModel.allRegisteredUsers;
   }


   //checks if their is an active document open
  public isActive(): boolean {
    return this._model.activeDocument !== undefined;
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
  async isARegisteredUser(user_id: CovDocUserID, password: string): Promise<boolean> {
    return (this._allRegisteredUsers.find(user => user === user_id ) !== undefined)
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
  
 /**
   * @returns BoardAreaModel that represents the current state of this BoardAreaController
   */
 public toInteractableAreaModel(): BoardAreaModel {
  return this._model;}


  /**
   * Applies updates to this board area controller's model, setting the relevant fields
   * from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: BoardAreaModel): void {
    //super._updateFrom(newModel);
    // this next line could be a thing
    // this.emit('docModified', newDoc);
 
    if (updatedModel.allRegisteredUsers !== this._model.allRegisteredUsers) {
      this._allRegisteredUsers = updatedModel.allRegisteredUsers;}
  
      this._model = updatedModel;
  
      //add emit statements for ui
  }
}
