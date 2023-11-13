//hello, this is me seeing how the codespace works. Are these changes viewable? 
//add this file to main

import { GameArea, GameInstanceID, GameState, InteractableID, PlayerID } from "../../types/CoveyTownSocket";
import { GameEventTypes } from "./GameAreaController";
import InteractableAreaController, { BaseInteractableEventMap } from "./InteractableAreaController";
import { ICDocArea as BoardAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from "../PlayerController";
import TownController from "../TownController";


/**
 * The events that a BoardAreaController can emit
 */
export type BoardAreaEvents = BaseInteractableEventMap & {
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



export default class BoardAreaController extends InteractableAreaController<BoardAreaEvents, BoardAreaModel> {

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


  public isActive(): boolean {
    return this._model.activeDocument !== undefined;
  }
  
  public openDocument(): void {
//user has input a userid and requested document id. open doc matching this id and see if user id matches
//have to use towncontroller.sendinteractable command? command type= 'openDoc'? how/where to create and define this new command type
//and how do we alter towncontroller and/or socket to accept this type of command?
}

    public closeDocument(): void {

    }

public createNewDocument(): void {

}

public validatePastUser(userID: string): boolean {
    return (this._allRegisteredUsers.find(user => user === userID ) !== undefined)
}

public createNewUser(): void {

    //also have to use towncontroller.sendinteractablecommand? how to implement?

    //add to this method so that a unique id is generated every time the method is executed.
    //also make it so that when a new user is registered, they are added to the document directory and/or database and asscociated
    //with no documents to begin with
}

 /**
   * @returns ViewingAreaModel that represents the current state of this ViewingAreaController
   */
    public toInteractableAreaModel(): BoardAreaModel {
        return this._model;}

  /**
   * Applies updates to this viewing area controller's model, setting the fields
   * isPlaying, elapsedTimeSec and video from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: BoardAreaModel): void {
    
    if (updatedModel.allRegisteredUsers !== this._model.allRegisteredUsers) {
    this._allRegisteredUsers = updatedModel.allRegisteredUsers;}

    this._model = updatedModel;

    //add emit statements for ui
  }

}