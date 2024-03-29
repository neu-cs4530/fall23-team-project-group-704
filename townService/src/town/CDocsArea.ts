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
  CDocDocID,
  TownEmitter,
  BoundingBox,
  ExtendedPermissionType,
  CDocUserID,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { ICDocServer } from './ICDocServer';
import CDocUserDataMap from './CDocUserDataMap';

// How to send different model to each user?
// TODO: this area for now will only handle one user
export default class CDocsArea extends InteractableArea {
  private _server: ICDocServer;

  private _userToDocMap: CDocUserDataMap;

  private _registeredUsers: CDocUserID[];

  /**
   * Creates a new ConversationArea
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this conversation area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    id: string,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
    server: ICDocServer,
  ) {
    super(id, coordinates, townEmitter);

    this._userToDocMap = new CDocUserDataMap();
    this._registeredUsers = [];
    this._server = server;
    // for some reason we have to pass the callback this._userToDocMap, or we get null error
    this._server.addDocumentEditedListener(doc =>
      this._handleDocumentEdited(doc, this._userToDocMap),
    );
    this._server.addSharedWithListener((docID, targetUser, permissionType) =>
      this._handleSharedWith(docID, targetUser, permissionType, this._userToDocMap),
    );
    this._setUpRegisteredUsers();
  }

  /**
   * WriteDoc: should tell the model to write the content to the specified doc.
   * Should also call _emitAreaChanged() if the doc is tracked
   *
   * GetDoc: should ask the server for the given docid and return it
   *
   * GetOwnedDocs: same as GetDoc, but also updates the cached state for this user,
   * such that toModel is now up to date
   *
   * OpenDoc: sets the given doc as 'active' for the user, and emits an area change event
   * the new toModel() value should indicate the given doc as active
   *
   * CloseDoc: should remove the given doc as the active doc if it is active, and
   * also emit an area change event
   *
   * CreateNewUser: creates the user with given username and password
   * throw error if given username is taken
   * also emit area change event
   *
   * Validate User: return true if user and password match
   *
   * Create New Doc: creates new document for the given user and returns the new doc id
   * emits area change event
   *
   * Share Doc: shares the document with the given person, and emits area change with cache updated
   * throws error if person doesn't exist or already has permissions on the given doc
   *
   * Remove User: should remove the user from the doc if such a permission exists,
   * should trigger update of cache and fire area change event
   *
   * Get Shared With Me: gets all docs shared with me based on permissiontype,
   * returning [] if there are none
   *
   * @param command
   * @param player
   * @returns
   */
  public async handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): Promise<InteractableCommandReturnType<CommandType>> {
    if (command.type === 'WriteDoc') {
      await this._server.writeToDoc(command.docid, command.content);
      this._handleDocumentEdited(command.docid, this._userToDocMap);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetDoc') {
      const doc = await this._server.getDoc(command.docid);
      return { doc } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetOwnedDocs') {
      const docs = await this._server.getOwnedDocs(command.id);
      this._userToDocMap.setOwnedDocs(command.id, docs);
      return { docs } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'OpenDoc') {
      const doc = await this._server.getDoc(command.docid);
      this._userToDocMap.setActiveDoc(command.userid, doc.docID);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'CloseDoc') {
      this._userToDocMap.closeActiveDoc(command.id);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'CreateNewUser') {
      await this._server.createNewUser(command.username, command.password);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ValidateUser') {
      const validated: boolean = await this._server.validateUser(command.id, command.password);
      return { validation: validated } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'CreateNewDoc') {
      const doc: ICDocDocument = await this._server.createNewDoc(command.id);
      this._userToDocMap.setOwnedDocs(
        command.id,
        this._userToDocMap.getOwnedDocsOrDefault(command.id).concat([doc.docID]),
      );
      this._emitAreaChanged();
      return { doc } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ShareDoc') {
      await this._server.shareDocumentWith(
        command.docID,
        command.targetUser,
        command.permissionType,
      );
      this._handleSharedWith(
        command.docID,
        command.targetUser,
        command.permissionType,
        this._userToDocMap,
      );
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'RemoveUser') {
      await this._server.removeUserFrom(command.docID, command.targetUser);
      this._handleSharedWith(command.docID, command.targetUser, 'REMOVE', this._userToDocMap);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GetSharedWithMe') {
      const docs: CDocDocID[] = await this._server.getSharedWith(
        command.userID,
        command.permissionType,
      );
      return { docs } as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  protected getType(): InteractableType {
    return 'CDocsArea';
  }

  toModel(): Interactable {
    const model: ICDocArea = {
      type: 'CDocsArea',
      id: this.id,
      occupants: this.occupantsByID,
      allRegisteredUsers: this._registeredUsers,
      docMap: this._userToDocMap.toData(),
    };
    return model;
  }

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
    server: ICDocServer,
  ): CDocsArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CDocsArea(name, rect, broadcastEmitter, server);
  }

  private _handleDocumentEdited(docid: CDocDocID, userToDocMap: CDocUserDataMap) {
    if (userToDocMap.isTrackingDoc(docid)) {
      this._emitAreaChanged();
    }
  }

  private _handleSharedWith(
    docID: CDocDocID,
    userID: CDocUserID,
    permissionType: ExtendedPermissionType,
    userToDocMap: CDocUserDataMap,
  ) {
    userToDocMap.shareWith(docID, userID, permissionType);
    this._emitAreaChanged();
  }

  private async _setUpRegisteredUsers() {
    this._registeredUsers = await this._server.getAllRegisteredUsers();
    this._server.addNewUserRegisteredListener(userID => this._registeredUsers.push(userID));
    this._emitAreaChanged();
  }
}
