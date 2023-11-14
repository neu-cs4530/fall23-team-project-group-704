import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  ICDocArea,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  ICDocDocument,
  CDocUserID,
  CDocDocID,
} from '../types/CoveyTownSocket';
import CDocServer from './CDocServer';
import InteractableArea from './InteractableArea';

// Ideas for dealing with async database operations:
// 1. Load entire database into memory at start
// 2. Have a multitry approach for frontend - have to try fetching multiple times until it works,
// it will work when the data has been loaded into the cache that is this class
// 3. Make frontend listen for the return value as an event

// How to send different model to each user?

export default class CDocsArea extends InteractableArea {
  private _server: CDocServer = new CDocServer();

  private _activeDocument: ICDocDocument;

  private _ownedDocuments: CDocDocID[];

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'WriteDoc') {
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
    return 'CDocsArea';
  }

  toModel(): Interactable {
    const model: ICDocArea = {
      activeDocument: this._activeDocument,
      ownedDocuments: this._ownedDocuments,
      type: 'CDocsArea',
      id: this.id,
      occupants: this.occupantsByID,
      allRegisteredUsers: [],
    };
    return model;
  }
}
