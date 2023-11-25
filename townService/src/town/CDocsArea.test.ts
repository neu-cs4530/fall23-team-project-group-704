import exp from 'constants';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import {
  CDocDocID,
  CDocGetDocCommand,
  CDocGetOwnedDocsCommand,
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
    });
  });
});
