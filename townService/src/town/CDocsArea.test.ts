import exp from 'constants';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import {
  CDocCloseDocCommand,
  CDocCreateNewUserCommand,
  CDocDocID,
  CDocGetDocCommand,
  CDocGetOwnedDocsCommand,
  CDocOpenDocCommand,
  CDocUserID,
  CDocValidateUserCommand,
  CDocWriteDocCommand,
  ICDocArea,
  ICDocDocument,
  TownEmitter,
} from '../types/CoveyTownSocket';
import CDocsArea from './CDocsArea';
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
      it('writes to the server and emits area change event', async () => {
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
          (testArea.toModel() as ICDocArea).userToDocMap.getOwnedDocs('test_owner'),
        ).toThrowError('User not found');

        const { docs } = (await testArea.handleCommand<CDocGetOwnedDocsCommand>(
          {
            type: 'GetOwnedDocs',
            id: 'test_owner',
          },
          newPlayer,
        )) as unknown as { docs: CDocDocID[] };

        expect(testDocs).toEqual(docs);
        expect((testArea.toModel() as ICDocArea).userToDocMap.getOwnedDocs('test_owner')).toEqual(
          testDocs,
        );
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
        expect((testArea.toModel() as ICDocArea).userToDocMap.getActiveDoc('test_user')).toEqual(
          'test_id',
        );
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
        expect((testArea.toModel() as ICDocArea).userToDocMap.getActiveDoc('test_user')).toEqual(
          'test_id',
        );
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
          (testArea.toModel() as ICDocArea).userToDocMap.getActiveDoc('test_user'),
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
  });
});
