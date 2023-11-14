import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  ICDocArea,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
<<<<<<< HEAD:townService/src/town/CovDocsArea.ts
  TicTacToeGameState,
  PlayerID,
=======
  ICDocDocument,
  CDocUserID,
  CDocDocID,
>>>>>>> 3237cbc (work on cdocsarea and handling of backend commands):townService/src/town/CDocsArea.ts
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

<<<<<<< HEAD:townService/src/town/CovDocsArea.ts
=======
// Ideas for dealing with async database operations:
// 1. Load entire database into memory at start
// 2. Have a multitry approach for frontend - have to try fetching multiple times until it works,
// it will work when the data has been loaded into the cache that is this class
// 3. Make frontend listen for the return value as an event

// How to send different model to each user?

export default class CDocsArea extends InteractableArea {
  private _server: CDocServer = new CDocServer();
>>>>>>> 3237cbc (work on cdocsarea and handling of backend commands):townService/src/town/CDocsArea.ts

  private _activeDocument: ICDocDocument;

  private _ownedDocuments: CDocDocID[];

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'WriteDoc') {
<<<<<<< HEAD:townService/src/town/CovDocsArea.ts
      this._emitAreaChanged();
      //this._server.writeToDoc(command.docid, command.content);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    // if (command.type === 'GetDoc') {
    //   const doc = this._server.getDoc(command.docid);
    //   return { doc } as InteractableCommandReturnType<CommandType>;
    // }
=======
      this._server.writeToDoc(command.docid, command.content).then(() => this._emitAreaChanged());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetDoc') {
      this._server.getDoc(command.docid).then(doc => {
        this._activeDocument = doc;
        this._emitAreaChanged();
      });
      return undefined as InteractableCommandReturnType<CommandType>;
    }
>>>>>>> 3237cbc (work on cdocsarea and handling of backend commands):townService/src/town/CDocsArea.ts
    if (command.type === 'GetOwnedDocs') {
      this._server.getOwnedDocs(command.id).then(ownedDocs => {
        this._ownedDocuments = ownedDocs;
        this._emitAreaChanged();
      });
      return undefined as InteractableCommandReturnType<CommandType>;
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
<<<<<<< HEAD:townService/src/town/CovDocsArea.ts
      allDocuments: this._allDocuments,
      allRegisteredUsers: this._allRegisteredUsers,
      type: this.getType(),
=======
      activeDocument: this._activeDocument,
      ownedDocuments: this._ownedDocuments,
      type: 'CDocsArea',
>>>>>>> 3237cbc (work on cdocsarea and handling of backend commands):townService/src/town/CDocsArea.ts
      id: this.id,
      occupants: this.occupantsByID,
    };
    return model;
  }
}
