import { CDocUserDataMap } from './CDocUserDataMap';

describe('CDocUserDataMap', () => {
  let cDocUserDataMap: CDocUserDataMap;

  beforeEach(() => {
    cDocUserDataMap = new CDocUserDataMap();
  });

  test('isTrackingDoc should return true when the document is being tracked', () => {
    const docId = 'yourDocId';
    cDocUserDataMap.setActiveDoc('userId1', docId);
    expect(cDocUserDataMap.isTrackingDoc(docId)).toBe(true);
  });

  test('isTrackingDoc should return false when the document is not being tracked', () => {
    const docId = 'yourDocId';
    expect(cDocUserDataMap.isTrackingDoc(docId)).toBe(false);
  });

  test('isTrackingDoc should throw an error when given a null string', () => {
    expect(() => cDocUserDataMap.isTrackingDoc('')).toThrow('Given null string in isTrackingDoc');
  });

  test('hasActiveDoc should return true when the user has an active document', () => {
    const userId = 'userId1';
    cDocUserDataMap.setActiveDoc(userId, 'docId');
    expect(cDocUserDataMap.hasActiveDoc(userId)).toBe(true);
  });

  test('hasActiveDoc should return false when the user does not have an active document', () => {
    const userId = 'userId1';
    expect(cDocUserDataMap.hasActiveDoc(userId)).toBe(false);
  });

  test('hasActiveDoc should throw an error when given a null string', () => {
    expect(() => cDocUserDataMap.hasActiveDoc('')).toThrow('Given null string in hasActiveDoc');
  });

  test('getActiveDoc should return the active document for a given user', () => {
    const userId = 'userId1';
    const activeDocId = 'docId';
    cDocUserDataMap.setActiveDoc(userId, activeDocId);
    expect(cDocUserDataMap.getActiveDoc(userId)).toBe(activeDocId);
  });

  test('getActiveDoc should throw an error when the user has no active document', () => {
    const userId = 'userId1';
    expect(() => cDocUserDataMap.getActiveDoc(userId)).toThrow('User has no active doc');
  });

  test('closeActiveDoc should set the active document to undefined for a given user', () => {
    const userId = 'userId1';
    cDocUserDataMap.setActiveDoc(userId, 'docId');
    cDocUserDataMap.closeActiveDoc(userId);
    expect(cDocUserDataMap.getActiveDoc(userId)).toBeUndefined();
  });

  test('setActiveDoc should set the active document for a given user', () => {
    const userId = 'userId1';
    const docId = 'docId';
    cDocUserDataMap.setActiveDoc(userId, docId);
    expect(cDocUserDataMap.getActiveDoc(userId)).toBe(docId);
  });

  test('setOwnedDocs should set the owned documents for a given user', () => {
    const userId = 'userId1';
    const docs = ['docId1', 'docId2'];
    cDocUserDataMap.setOwnedDocs(userId, docs);
    expect(cDocUserDataMap.getOwnedDocs(userId)).toEqual(docs);
  });

  test('getOwnedDocs should return the owned documents for a given user', () => {
    const userId = 'userId1';
    const docs = ['docId1', 'docId2'];
    cDocUserDataMap.setOwnedDocs(userId, docs);
    expect(cDocUserDataMap.getOwnedDocs(userId)).toEqual(docs);
  });

  test('getOwnedDocs should throw an error when the user has no active document', () => {
    const userId = 'userId1';
    expect(() => cDocUserDataMap.getOwnedDocs(userId)).toThrow('User has no active doc');
  });

  test('getOwnedDocsOrDefault should return the owned documents for a given user or an empty array', () => {
    const userId = 'userId1';
    const docs = ['docId1', 'docId2'];
    cDocUserDataMap.setOwnedDocs(userId, docs);
    expect(cDocUserDataMap.getOwnedDocsOrDefault(userId)).toEqual(docs);
    expect(cDocUserDataMap.getOwnedDocsOrDefault('nonexistentUserId')).toEqual([]);
  });

  test('setOwnedDocs should throw an error when the user does not exist', () => {
    const userId = 'nonexistentUserId';
    const docs = ['docId1', 'docId2'];
    expect(() => cDocUserDataMap.setOwnedDocs(userId, docs)).toThrow(
      'Given null string in setOwnedDocs',
    );
  });

  test('setActiveDoc should throw an error when given a null string as user ID', () => {
    const docId = 'yourDocId';
    expect(() => cDocUserDataMap.setActiveDoc('', docId)).toThrow(
      'Given null string in setActiveDoc',
    );
  });

  test('setActiveDoc should throw an error when given a null string as document ID', () => {
    const userId = 'userId1';
    expect(() => cDocUserDataMap.setActiveDoc(userId, '')).toThrow(
      'Given null string in setActiveDoc',
    );
  });

  test('setOwnedDocs should throw an error when given a null string as user ID', () => {
    const docs = ['docId1', 'docId2'];
    expect(() => cDocUserDataMap.setOwnedDocs('', docs)).toThrow(
      'Given null string in setOwnedDocs',
    );
  });

  test('setOwnedDocs should throw an error when given null as the array of owned documents', () => {
    const userId = 'userId1';
    expect(() => cDocUserDataMap.setOwnedDocs(userId, [])).toThrow(
      'Given null string in setOwnedDocs',
    );
  });

  test('getOwnedDocsOrDefault should return an empty array when the user does not exist', () => {
    const userId = 'nonexistentUserId';
    expect(cDocUserDataMap.getOwnedDocsOrDefault(userId)).toEqual([]);
  });
});
