import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ICDocDocument } from '../types/CoveyTownSocket';
import MockCDocServer from './MockCDocServer';

describe('CDocServer', () => {
  describe('createNewDoc', () => {
    const mockCDocServer: MockCDocServer = new MockCDocServer();

    it('creates a new document with the given owner', async () => {
      const owner = 'testUser';

      // Mock the behavior of nanoid to ensure consistent docID for testing
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      jest.spyOn(require('nanoid'), 'nanoid').mockReturnValue('mockedDocID');

      const newDoc: ICDocDocument = await mockCDocServer.createNewDoc(owner);

      expect(newDoc.owner).toBe('mock owner');
      expect(newDoc.docID).toBe('fakeID');
      expect(newDoc.createdAt).toBeDefined();
      expect(newDoc.docName).toBe('mock name');
      expect(newDoc.editors).toHaveLength(0);
      expect(newDoc.viewers).toHaveLength(0);
      expect(newDoc.content).toBe('mock content');
    });
  });

  describe('addSharedWithListener', () => {
    it('adds shared listener to listener list', () => {});
  });

  describe('removeSharedWithListener', () => {
    it('removes given listener from listener list', () => {});
  });

  describe('getSharedWith', () => {
    it('retrieves sharedwith list', () => {});
  });

  describe('shareDocumentWith', () => {
    it('shares document with specified user', () => {});
  });

  describe('validateUser', () => {
    it('validates a valid user id', () => {});
  });

  describe('addDocumentEditedListener', () => {
    it('adds specified listener to documenteditedlistener list', () => {});
  });

  describe('removeDocumentEditedListener', () => {
    it('removes specified listener from list', () => {});
  });

  describe('getInstance', () => {
    it('returns this instance of CDocServer', () => {});
  });

  describe('createNewDoc', () => {
    it('creates a new doc with default name', () => {});
  });

  describe('createNewUser', () => {
    it('creates a new user with the given name', () => {});
  });

  describe('getOwnedDocs', () => {
    it('retrieves the users owned docs', () => {});
  });
  describe('writeToDoc', () => {
    it('writes the given content to the document', () => {});
  });

  describe('getDoc', () => {
    it('gets the speficied document', () => {});
  });
});
