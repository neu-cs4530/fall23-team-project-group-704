import { BroadcastOperator } from 'socket.io';
import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
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
  ServerToClientEvents,
  SocketData,
  TownEmitter,
  BoundingBox,
} from '../types/CoveyTownSocket';
import CDocServer from './CDocServer';
import InteractableArea from './InteractableArea';

// How to send different model to each user?
// TODO: this area for now will only handle one user
export default class CDocsArea extends InteractableArea {
  private _server: CDocServer = new CDocServer();

  // TODO: I will duplicate the model state by caching it here and sending it
  // in toModel, and also directly return parts of the model through the handleCommand return
  private _activeDocument: ICDocDocument;

  private _ownedDocuments: CDocDocID[];

  /**
   * Creates a new ConversationArea
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this conversation area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
  }

  public async handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): Promise<InteractableCommandReturnType<CommandType>> {
    if (command.type === 'WriteDoc') {
      await this._server.writeToDoc(command.docid, command.content);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetDoc') {
      const doc = await this._server.getDoc(command.docid);
      this._activeDocument = doc;
      return { doc } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetOwnedDocs') {
      const docs = await this._server.getOwnedDocs(command.id);
      this._ownedDocuments = docs;
      return { docs } as InteractableCommandReturnType<CommandType>;
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

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): CDocsArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CDocsArea(name, rect, broadcastEmitter);
  }
}
