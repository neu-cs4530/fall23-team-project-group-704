import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  ICDocArea,
  GameInstance,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  TicTacToeGameState,
  PlayerID,
} from '../types/CoveyTownSocket';
import CovDocsServer from './CDocServer';
import InteractableArea from './InteractableArea';
import { ICDocDocument } from '../types/CoveyTownSocket';

export default class CovDocsArea extends InteractableArea {
  private _server: CovDocsServer = new CovDocsServer(); //is server necessary? there is no server field in the analogous gameArea file

  protected _allDocuments: ICDocDocument[];

  protected _allRegisteredUsers: PlayerID[];

//need a state_updated function that emits areaChanged?
//(possibly) missing functions: removeplayer, getgame, gethistory


  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'WriteDoc') {
      this._emitAreaChanged();
      //this._server.writeToDoc(command.docid, command.content);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    // if (command.type === 'GetDoc') {
    //   const doc = this._server.getDoc(command.docid);
    //   return { doc } as InteractableCommandReturnType<CommandType>;
    // }
    if (command.type === 'GetOwnedDocs') {
      const docs = this._server.getOwnedDocs(command.id);
      return { docs } as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  protected getType(): InteractableType {
    return 'CovDocsArea';
  }

  public get isActive(): boolean {
    return true;
  }

  toModel(): Interactable {
    const model: ICDocArea = {
      allDocuments: this._allDocuments,
      allRegisteredUsers: this._allRegisteredUsers,
      type: this.getType(),
      id: this.id,
      occupants: this.occupantsByID,
    };
    return model;
  }
}
