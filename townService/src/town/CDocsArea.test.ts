import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import {
  CDocCloseDocCommand,
  CDocCreateNewDocCommand,
  CDocCreateNewUserCommand,
  CDocDocID,
  CDocGetDocCommand,
  CDocGetOwnedDocsCommand,
  CDocGetSharedWithMe,
  CDocOpenDocCommand,
  CDocRemoveUserCommand,
  CDocShareDocCommand,
  CDocUserID,
  CDocValidateUserCommand,
  CDocWriteDocCommand,
  ICDocArea,
  ICDocDocument,
  TownEmitter,
} from '../types/CoveyTownSocket';
import CDocsArea from './CDocsArea';
import CDocUserDataMap from './CDocUserDataMap';
import { ICDocServer } from './ICDocServer';

const testDoc: ICDocDocument = {
  createdAt: 'fake_date',
  owner: 'fake_owner',
  docID: 'test_id',
  docName: 'test_name',
  editors: [],
  viewers: [],
  content: 'test content',
};

describe('CDocsArea', () => {
  let testArea: CDocsArea;
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let townEmitter = mock<TownEmitter>();
  let mockServer = mock<ICDocServer>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    townEmitter = mock<TownEmitter>();
    mockServer = mock<ICDocServer>();
    testArea = new CDocsArea(id, testAreaBox, townEmitter, mockServer);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('handleCommand', () => {
    describe('writeDoc', () => {
      it('writes to the server and does not emit event since document is not opened', async () => {
        mockClear(townEmitter.emit);
        mockClear(mockServer.writeToDoc);

        await testArea.handleCommand<CDocWriteDocCommand>(
          {
            type: 'WriteDoc',
            content: 'test content',
            docid: 'test_id',
          },
          newPlayer,
        );
        expect(mockServer.writeToDoc).toHaveBeenCalledWith('test_id', 'test content');
        expect(townEmitter.emit).toHaveBeenCalledTimes(0);
      });
      it('writes to the server and does emit event since document is opened', async () => {
        mockClear(townEmitter.emit);
        mockClear(mockServer.writeToDoc);

        mockServer.getDoc.mockImplementation(async (docID: CDocDocID) => {
          const doc: ICDocDocument = {
            createdAt: '',
            owner: 'test_user',
            docID: 'test_id',
            docName: '',
            editors: [],
            viewers: [],
            content: '',
          };
          return doc;
        });

        await testArea.handleCommand<CDocOpenDocCommand>(
          {
            type: 'OpenDoc',
            docid: 'test_id',
            userid: 'test_user',
          },
          newPlayer,
        );

        mockClear(townEmitter.emit);
        await testArea.handleCommand<CDocWriteDocCommand>(
          {
            type: 'WriteDoc',
            content: 'test content',
            docid: 'test_id',
          },
          newPlayer,
        );
        expect(mockServer.writeToDoc).toHaveBeenCalledWith('test_id', 'test content');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('getDoc', () => {
      it('asks the server for the given docid and returns it', async () => {
        mockServer.getDoc.mockImplementation(async docID => {
          if (docID === 'test_id') {
            return testDoc;
          }
          throw Error();
        });

        const { doc } = (await testArea.handleCommand<CDocGetDocCommand>(
          {
            type: 'GetDoc',
            docid: 'test_id',
          },
          newPlayer,
        )) as unknown as { doc: ICDocDocument };
        expect(doc).toEqual(testDoc);
      });
    });
    describe('getOwnedDocs', () => {
      it('returns the owned docs and updates the cached state such that toModel returns the same owned docs', async () => {
        const testDocs: CDocDocID[] = [];
        for (let i = 0; i < 3; i++) testDocs.push(`docID_${i}`);

        mockServer.getOwnedDocs.mockImplementation(async userID => {
          if (userID === 'test_owner') {
            return testDocs;
          }
          throw Error();
        });

        // toModel should not return correct result yet
        expect(() =>
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getOwnedDocs(
            'test_owner',
          ),
        ).toThrowError('User not found');

        const { docs } = (await testArea.handleCommand<CDocGetOwnedDocsCommand>(
          {
            type: 'GetOwnedDocs',
            id: 'test_owner',
          },
          newPlayer,
        )) as unknown as { docs: CDocDocID[] };

        expect(testDocs).toEqual(docs);
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getOwnedDocs(
            'test_owner',
          ),
        ).toEqual(testDocs);
      });
    });
    describe('OpenDoc', () => {
      it('sets the given doc as active for the user and emits area change event', async () => {
        mockClear(townEmitter.emit);
        mockServer.getDoc.mockImplementation(async docID => {
          if (docID === 'test_id') return testDoc;
          throw Error();
        });

        await testArea.handleCommand<CDocOpenDocCommand>(
          {
            type: 'OpenDoc',
            docid: 'test_id',
            userid: 'test_user',
          },
          newPlayer,
        );
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getActiveDoc(
            'test_user',
          ),
        ).toEqual('test_id');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('CloseDoc', () => {
      it('should remove the given doc as the active doc if it is active, and should fire an area change event', async () => {
        // Repeat the open doc test
        mockClear(townEmitter.emit);
        mockServer.getDoc.mockImplementation(async docID => {
          if (docID === 'test_id') return testDoc;
          throw Error();
        });

        await testArea.handleCommand<CDocOpenDocCommand>(
          {
            type: 'OpenDoc',
            docid: 'test_id',
            userid: 'test_user',
          },
          newPlayer,
        );
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getActiveDoc(
            'test_user',
          ),
        ).toEqual('test_id');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);

        mockClear(townEmitter.emit);
        // now perform the close doc test
        await testArea.handleCommand<CDocCloseDocCommand>(
          {
            type: 'CloseDoc',
            id: 'test_user',
          },
          newPlayer,
        );
        expect(() =>
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getActiveDoc(
            'test_user',
          ),
        ).toThrowError('User has no active doc');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('CreateUser', () => {
      it('create given user and fire area change event', async () => {
        mockClear(townEmitter.emit);
        mockClear(mockServer.createNewUser);
        await testArea.handleCommand<CDocCreateNewUserCommand>(
          {
            type: 'CreateNewUser',
            username: 'new_user',
            password: 'password',
          },
          newPlayer,
        );
        expect(mockServer.createNewUser).toHaveBeenCalledWith('new_user', 'password');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('ValidateUser', () => {
      it('return true if user and password match, forward args to CDocServer', async () => {
        mockServer.validateUser.mockImplementation(
          async (user: CDocUserID, password: string) =>
            user === 'test_user' && password === 'test_password',
        );

        const { validation } = (await testArea.handleCommand<CDocValidateUserCommand>(
          {
            type: 'ValidateUser',
            id: 'test_user',
            password: 'test_password',
          },
          newPlayer,
        )) as unknown as { validation: boolean };
        expect(mockServer.validateUser).toHaveBeenCalledWith('test_user', 'test_password');
        expect(validation).toBeTruthy();
      });
    });
    describe('CreateNewDoc', () => {
      it('creates a new doc for the given user and returns it, delegating to CDocServer to create the doc and firing an area change event', async () => {
        mockClear(townEmitter.emit);
        mockServer.createNewDoc.mockImplementation(async userid => testDoc);
        const { doc } = (await testArea.handleCommand<CDocCreateNewDocCommand>(
          {
            type: 'CreateNewDoc',
            id: 'test_user',
          },
          newPlayer,
        )) as unknown as { doc: ICDocDocument };
        expect(mockServer.createNewDoc).toHaveBeenCalledWith('test_user');
        expect(doc).toEqual(testDoc);
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('ShareDoc', () => {
      it('delegates to mockServer to share the doc with the person, and emits area change event with cache update', async () => {
        mockClear(townEmitter.emit);
        await testArea.handleCommand<CDocShareDocCommand>(
          {
            type: 'ShareDoc',
            docID: 'test_id',
            targetUser: 'test_user',
            permissionType: 'EDIT',
          },
          newPlayer,
        );
        expect(mockServer.shareDocumentWith).toHaveBeenCalledWith('test_id', 'test_user', 'EDIT');
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'EDIT',
          ),
        ).toHaveLength(1);
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'VIEW',
          ),
        ).toHaveLength(0);
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
      it('delegates to mockServer to share the doc with the person, and emits area change event with cache update', async () => {
        mockClear(townEmitter.emit);
        await testArea.handleCommand<CDocShareDocCommand>(
          {
            type: 'ShareDoc',
            docID: 'test_id',
            targetUser: 'test_user',
            permissionType: 'VIEW',
          },
          newPlayer,
        );
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'EDIT',
          ),
        ).toHaveLength(0);
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'VIEW',
          ),
        ).toHaveLength(1);

        expect(mockServer.shareDocumentWith).toHaveBeenCalledWith('test_id', 'test_user', 'VIEW');
        expect(townEmitter.emit).toHaveBeenCalledTimes(1);
      });
    });
    describe('RemoveUser', () => {
      it('should delegate to the mockServer removeUser, should trigger update of cache and fire area change event', async () => {
        // repeat share doc test to set up cached state
        await testArea.handleCommand<CDocShareDocCommand>(
          {
            type: 'ShareDoc',
            docID: 'test_id',
            targetUser: 'test_user',
            permissionType: 'VIEW',
          },
          newPlayer,
        );
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'VIEW',
          ),
        ).toHaveLength(1);

        mockClear(mockServer.removeUserFrom);
        mockClear(townEmitter.emit);
        await testArea.handleCommand<CDocRemoveUserCommand>(
          {
            type: 'RemoveUser',
            docID: 'test_id',
            targetUser: 'test_user',
          },
          newPlayer,
        );

        expect(mockServer.removeUserFrom).toHaveBeenCalledWith('test_id', 'test_user');
        // check that cached state is modified
        expect(
          CDocUserDataMap.fromData((testArea.toModel() as ICDocArea).docMap).getSharedDocs(
            'test_user',
            'VIEW',
          ),
        ).toHaveLength(0);
      });
    });
    describe('GetSharedWithMe', () => {
      it('delegates call to server', async () => {
        mockClear(mockServer.getSharedWith);
        await testArea.handleCommand<CDocGetSharedWithMe>(
          {
            type: 'GetSharedWithMe',
            userID: 'test_user',
            permissionType: 'EDIT',
          },
          newPlayer,
        );
        expect(mockServer.getSharedWith).toHaveBeenCalledWith('test_user', 'EDIT');
      });
      it('gets the docs shared with the person', async () => {
        mockServer.getSharedWith.mockImplementation(async (user, permissionType) => {
          if (user === 'test_user' && permissionType === 'EDIT') return ['id1', 'id2', 'id3'];
          return [];
        });
        const { docs } = (await testArea.handleCommand<CDocGetSharedWithMe>(
          {
            type: 'GetSharedWithMe',
            userID: 'test_user',
            permissionType: 'EDIT',
          },
          newPlayer,
        )) as unknown as { docs: CDocDocID[] };
        expect(docs).toEqual(['id1', 'id2', 'id3']);
      });
    });
  });
});
