import exp from 'constants';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import appDataSource from '../api/datasource';
import CDocServer from './CDocServer';

const TEST_USER = 'testUser';

describe('CDocServer', () => {
  beforeAll(async () => {
    await appDataSource.initialize();
  });
  describe('getInstance', () => {
    it('returns same instance each time', () => {
      const instances: CDocServer[] = [];
      instances.push(CDocServer.getInstance());
      instances.push(CDocServer.getInstance());
      instances.push(CDocServer.getInstance());
      instances.push(CDocServer.getInstance());
      instances.push(CDocServer.getInstance());

      expect(instances.map(i => i === instances[0])).toEqual([true, true, true, true, true]);
    });
  });
  describe('createNewDoc', () => {
    it('creates a new doc', async () => {
      const doc = await CDocServer.getInstance().createNewDoc(TEST_USER);
      expect(doc.owner).toEqual(TEST_USER);
    });
  });
  describe('createNewUser', () => {
    it('creates a new user and fails if the username is already taken', async () => {
      const name = nanoid();
      const password = nanoid();
      await CDocServer.getInstance().createNewUser(name, password);
      const validation = await CDocServer.getInstance().validateUser(name, password);
      expect(validation).toEqual(true);
      expect(
        (await CDocServer.getInstance().getAllRegisteredUsers()).find(user => user === name),
      ).toBeDefined();

      // try creating another user with same username
      await expect(CDocServer.getInstance().createNewUser(name, password)).rejects.toThrowError(
        'User already exists',
      );
    });
  });
  describe('validateUser', () => {
    it('returns true for a correct username/password, and false for an incorrect username/password', async () => {
      const name = nanoid();
      const password = nanoid();
      await CDocServer.getInstance().createNewUser(name, password);
      const validation = await CDocServer.getInstance().validateUser(name, password);
      expect(validation).toEqual(true);

      expect(await CDocServer.getInstance().validateUser(name, password.concat('fake'))).toEqual(
        false,
      );
      expect(await CDocServer.getInstance().validateUser(name.concat('fake'), password)).toEqual(
        false,
      );
      expect(
        await CDocServer.getInstance().validateUser(name.concat('fake'), password.concat('fake')),
      ).toEqual(false);
    });
    describe('getOwnedDocs', () => {
      it('returns [] if user does not exist', async () => {
        expect(await CDocServer.getInstance().getOwnedDocs(nanoid())).toEqual([]);
      });
      it('gets the owned documents of a user', async () => {
        const user = nanoid();
        const password = nanoid();
        await CDocServer.getInstance().createNewUser(user, password);
        const doc1 = await CDocServer.getInstance().createNewDoc(user);
        const doc2 = await CDocServer.getInstance().createNewDoc(user);
        const doc3 = await CDocServer.getInstance().createNewDoc(user);
        const ownedDocs = await CDocServer.getInstance().getOwnedDocs(user);
        expect(ownedDocs).toEqual([doc1.docID, doc2.docID, doc3.docID]);
      });
    });
    describe('writeToDoc', () => {
      it('does not throw error if doc does not exist, fires event', async () => {
        // A better behavior to have in the implementation would be not firing the event...
        const listener = mock((docid: string) => {});
        CDocServer.getInstance().addDocumentEditedListener(listener);
        const randID = nanoid();
        await CDocServer.getInstance().writeToDoc(randID, 'random content');
        expect(listener).toHaveBeenCalledWith(randID);
        CDocServer.getInstance().removeDocumentEditedListener(listener);
      });
      it('overwrites contents of doc, fires event', async () => {
        const listener = mock((docid: string) => {});
        CDocServer.getInstance().addDocumentEditedListener(listener);
        const doc = await CDocServer.getInstance().createNewDoc('test_user');
        const randomContent = 'random content';

        expect(randomContent !== doc.content).toEqual(true);
        await CDocServer.getInstance().writeToDoc(doc.docID, randomContent);

        expect(listener).toHaveBeenCalledWith(doc.docID);
        CDocServer.getInstance().removeDocumentEditedListener(listener);

        expect((await CDocServer.getInstance().getDoc(doc.docID)).content).toEqual(randomContent);
      });
    });
    describe('getDoc', () => {
      it('if doc does not exist, throws error', async () => {
        await expect(CDocServer.getInstance().getDoc(nanoid())).rejects.toThrow(
          new Error('Document not found'),
        );
      });
      it('returns document by id', async () => {
        const doc = await CDocServer.getInstance().createNewDoc('test_user');

        expect((await CDocServer.getInstance().getDoc(doc.docID)).content).toEqual(doc);
      });
    });
    describe('getRegisteredUsers', () => {
      it('returns all registered users', async () => {
        await CDocServer.getInstance().createNewUser(nanoid(), nanoid());
        expect((await CDocServer.getInstance().getAllRegisteredUsers()).length).toBeGreaterThan(0);
      });
    });
    describe('');
  });
});
