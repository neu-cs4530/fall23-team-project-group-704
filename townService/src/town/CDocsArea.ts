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
} from '../types/CoveyTownSocket';
import CDocServer from './CDocServer';
import InteractableArea from './InteractableArea';

export default class CDocsArea extends InteractableArea {
  private _server: CDocServer = new CDocServer();

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'WriteDoc') {
      this._emitAreaChanged();
      this._server.writeToDoc(command.docid, command.content);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetDoc') {
      const doc = this._server.getDoc(command.docid);
      return { doc } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetOwnedDocs') {
      const docs = this._server.getOwnedDocs(command.id);
      return { docs } as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  protected getType(): InteractableType {
    return 'CDocsArea';
  }

  toModel(): Interactable {
    const model: ICDocArea = {
      allDocuments: [],
      allRegisteredUsers: [],
      type: 'ConversationArea',
      id: '',
      occupants: [],
    };
    return model;
  }
}
