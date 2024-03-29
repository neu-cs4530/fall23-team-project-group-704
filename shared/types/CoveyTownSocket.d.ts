export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
};

export type InteractableType =
  | "ConversationArea"
  | "ViewingArea"
  | "TicTacToeArea"
  | "CDocsArea";
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
};

export type Direction = "front" | "back" | "left" | "right";

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
}

export type XY = { x: number; y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
}
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea extends Interactable {
  topic?: string;
}
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

/* comments
 */
export interface ICDocDocument {
  createdAt: string;
  owner: CDocUserID;
  docID: string;
  docName: string;
  editors: CDocUserID[];
  viewers: CDocUserID[];
  content: string;
}

/**
 * Represents the state of the model for one user.
 * TODO: find way to return a different model to each user
 */
export interface ICDocArea extends Interactable {
  docMap: [CDocUserID, CDocUserData][];
  allRegisteredUsers: PlayerID[];
}
/**
 * Readonly interface.
 */
export interface ICDocUserDataMap {
  isTrackingDoc(docid: string): boolean;
  hasActiveDoc(userid: CDocUserID): boolean;
  getActiveDoc(userid: CDocUserID): CDocDocID;

  getOwnedDocs(userid: CDocUserID): CDocDocID[];

  getOwnedDocsOrDefault(userid: CDocUserID): CDocDocID[];

  getSharedDocs(userID: CDocUserID, permissionType: PermissionType): CDocDocID[];
}

export type CDocDocID = string;
export type CDocUserID = string;
export type CDocHTMLContent = string;
export type CDocPassword = string;

export type GameStatus = "IN_PROGRESS" | "WAITING_TO_START" | "OVER";
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
}

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: "X" | "O";
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<MoveType> | LeaveGameCommand |
CDocWriteDocCommand | CDocOpenDocCommand | CDocCloseDocCommand | CDocValidateUserCommand | CDocCreateNewUserCommand |
CDocCreateNewDocCommand | CDocGetOwnedDocsCommand | CDocGetDocCommand | CDocShareDocCommand | CDocRemoveUserCommand | CDocGetSharedWithMe;

export interface ViewingAreaUpdateCommand {
  type: "ViewingAreaUpdate";
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: "JoinGame";
}
export interface LeaveGameCommand {
  type: "LeaveGame";
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: "GameMove";
  gameID: GameInstanceID;
  move: MoveType;
}

export interface CDocWriteDocCommand {
  type: "WriteDoc";
  content: string;
  docid: string;
}

/**
 * returns the document specified by the id.
 * TODO: add permissions to this
 */
export interface CDocGetDocCommand {
  type: "GetDoc";
  docid: CDocDocID;
}

export interface CDocValidateUserCommand {
  type: "ValidateUser";
  id: CDocUserID;
  password: CDocPassword;
}
export interface CDocCreateNewUserCommand {
  type: "CreateNewUser";
  username: CDocUserID;
  password: CDocPassword;
}
export interface CDocCreateNewDocCommand {
  type: "CreateNewDoc";
  id: CDocUserID;
}
export interface CDocGetOwnedDocsCommand {
  type: "GetOwnedDocs";
  id: CDocUserID;
}

export type PermissionType = 'EDIT' | 'VIEW';

export type ExtendedPermissionType = PermissionType | 'REMOVE';

export interface CDocShareDocCommand {type: 'ShareDoc'; docID: CDocDocID; targetUser: CDocUserID; permissionType: PermissionType}

/**
 * Removes user from document, but not the owner
 */
export interface CDocRemoveUserCommand {type:'RemoveUser'; docID: CDocDocID; targetUser: CDocUserID;}

export interface CDocGetSharedWithMe {type: 'GetSharedWithMe'; userID: CDocUserID; permissionType: PermissionType}

/**
 * Tells this area to associate this document with the caller.
 * This document is assumed to be open on the frontend for the user, so
 * the state changed event will be then fired if this document is changed.
 */
export interface CDocOpenDocCommand {
  type: "OpenDoc";
  docid: string;
  userid: CDocUserID;
}

/**
 * Closes the document for this user.
 */
export interface CDocCloseDocCommand {
  type: "CloseDoc";
  id: CDocDocID;
}

// export interface CDocument {
//   name: string;
//   ownerID: string;
//   permissions: {view: boolean, edit: boolean};
//   last_saved: string
//   last_user: string;
// }

// we have to modify this too
export type InteractableCommandReturnType<CommandType extends InteractableCommand> =
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  CommandType extends CDocWriteDocCommand ? undefined :
  CommandType extends CreateDocCommand ? undefined :
  CommandType extends CDocGetDocCommand ? {doc: ICDocDocument} :
  CommandType extends CDocsGetOwnedDocs ? {docs: CDocDocID[]} :
  CommandType extends CDocValidateUserCommand ? {validation: boolean} :
  CommandType extends CDocCreateNewDocCommand ? {doc: ICDocDocument} :
  CommandType extends CDocShareDocCommand ? undefined :
  CommandType extends CDocRemoveUserCommand ? undefined :
  CommandType extends CDocGetSharedWithMe ? {docs: CDocDocID[]} : 
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
};

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (
    command: InteractableCommand & InteractableCommandBase,
  ) => void;
}
