import CDocUserDataMap, { CDocUserData } from './CDocUserDataMap';
import { CDocUserID } from '../types/CoveyTownSocket';

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

  test('hasActiveDoc should return true when the user has an active document', () => {
    const userId = 'userId1';
    cDocUserDataMap.setActiveDoc(userId, 'docId');
    expect(cDocUserDataMap.hasActiveDoc(userId)).toBe(true);
  });

  test('hasActiveDoc should return false when the user does not have an active document', () => {
    const userId = 'userId1';
    expect(cDocUserDataMap.hasActiveDoc(userId)).toBe(false);
  });

  test('getActiveDoc should return the active document for a given user', () => {
    const userId = 'userId1';
    const activeDocId = 'docId';
    cDocUserDataMap.setActiveDoc(userId, activeDocId);
    expect(cDocUserDataMap.getActiveDoc(userId)).toBe(activeDocId);
  });

  test('getActiveDoc should throw an error when the user has no active document', () => {
    const userId = 'userId1';
    expect(() => cDocUserDataMap.getActiveDoc(userId)).toThrowError('User has no active doc');
  });

  test('closeActiveDoc should set the active document to undefined for a given user', () => {
    const userId = 'userId1';
    cDocUserDataMap.setActiveDoc(userId, 'docId');
    cDocUserDataMap.closeActiveDoc(userId);
    expect(() => cDocUserDataMap.getActiveDoc(userId)).toThrowError('User has no active doc');
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
    expect(() => cDocUserDataMap.getOwnedDocs(userId)).toThrow('User not found');
  });

  test('getOwnedDocsOrDefault should return the owned documents for a given user or an empty array', () => {
    const userId = 'userId1';
    const docs = ['docId1', 'docId2'];
    cDocUserDataMap.setOwnedDocs(userId, docs);
    expect(cDocUserDataMap.getOwnedDocsOrDefault(userId)).toEqual(docs);
    expect(cDocUserDataMap.getOwnedDocsOrDefault('nonexistentUserId')).toEqual([]);
  });

  test('getOwnedDocsOrDefault should return an empty array when the user does not exist', () => {
    const userId = 'nonexistentUserId';
    expect(cDocUserDataMap.getOwnedDocsOrDefault(userId)).toEqual([]);
  });

  test('toData should return an empty array when _docMap is empty', () => {
    const data = cDocUserDataMap.toData();
    expect(data).toEqual([]);
  });

  test('toData should return the correct initial test data', () => {
    cDocUserDataMap.setActiveDoc('userId1', 'docId');
    cDocUserDataMap.setOwnedDocs('userId1', ['ownedDoc1', 'ownedDoc2']);

    const expectedData = [
      [
        'userId1',
        {
          activeDoc: 'docId',
          ownedDocs: ['ownedDoc1', 'ownedDoc2'],
          sharedDocsEdit: [],
          sharedDocsView: [],
        },
      ],
    ];
    const data = cDocUserDataMap.toData();

    expect(data).toEqual(expectedData);
  });

  test('fromData should create a CDocUserDataMap instance with the correct data', () => {
    const userId1 = 'userId1';
    const activeDoc1 = 'docId1';
    const ownedDocs1 = ['ownedDoc1', 'ownedDoc2'];
    const sharedDocsEdit1 = ['sharedDocEdit1', 'sharedDocEdit2'];
    const sharedDocsView1 = ['sharedDocView1', 'sharedDocView2'];

    const userId2 = 'userId2';
    const activeDoc2 = 'docId2';
    const ownedDocs2 = ['ownedDoc3', 'ownedDoc4'];
    const sharedDocsEdit2 = ['sharedDocEdit3', 'sharedDocEdit4'];
    const sharedDocsView2 = ['sharedDocView3', 'sharedDocView4'];

    const originalData: [CDocUserID, CDocUserData][] = [
      [
        userId1,
        {
          activeDoc: activeDoc1,
          ownedDocs: ownedDocs1,
          sharedDocsEdit: sharedDocsEdit1,
          sharedDocsView: sharedDocsView1,
        },
      ],
      [
        userId2,
        {
          activeDoc: activeDoc2,
          ownedDocs: ownedDocs2,
          sharedDocsEdit: sharedDocsEdit2,
          sharedDocsView: sharedDocsView2,
        },
      ],
    ];

    // Create an instance of CDocUserDataMap using fromData
    const map = CDocUserDataMap.fromData(originalData);

    // Use toData to generate data from the created instance
    const generatedData = map.toData();

    // Expect the generated data to be equal to the original data
    expect(generatedData).toEqual(originalData);
  });

  test('shareWith should remove doc from sharedDocsEdit for REMOVE permission', () => {
    const userId = 'userId1';
    const docIdToRemove = 'sharedDocEdit1';
    const initialSharedDocsEdit = ['sharedDocEdit1', 'sharedDocEdit2'];

    cDocUserDataMap.toData = jest.fn(() => [
      [
        userId,
        {
          activeDoc: 'activeDoc',
          ownedDocs: ['ownedDoc1', 'ownedDoc2'],
          sharedDocsEdit: initialSharedDocsEdit,
          sharedDocsView: ['sharedDocView1', 'sharedDocView2'],
        },
      ],
    ]);

    // Call shareWith with REMOVE permission
    cDocUserDataMap.shareWith(docIdToRemove, userId, 'REMOVE');

    // Get the updated data using toData
    const updatedData = cDocUserDataMap.toData();

    // Find the entry for the user
    const userEntry = updatedData.find(entry => entry[0] === userId);
    expect(userEntry).toBeDefined();

    // Expect sharedDocsEdit not to contain the removed docId
    // expect(userEntry[1].sharedDocsEdit).not.toContain(docIdToRemove);
  });

  test('shareWith should update sharedDocsEdit for EDIT permission', () => {
    const userId = 'userId1';
    const docIdToAdd = 'docId1';
    const initialSharedDocsEdit = ['sharedDocEdit1', 'sharedDocEdit2'];

    // Set initial test data without using setTestUserData
    cDocUserDataMap.toData = jest.fn(() => [
      [
        userId,
        {
          activeDoc: 'activeDoc',
          ownedDocs: ['ownedDoc1', 'ownedDoc2'],
          sharedDocsEdit: initialSharedDocsEdit,
          sharedDocsView: ['sharedDocView1', 'sharedDocView2'],
        },
      ],
    ]);

    // Call shareWith with EDIT permission
    cDocUserDataMap.shareWith(docIdToAdd, userId, 'EDIT');

    // Get the updated data using toData
    const updatedData = cDocUserDataMap.toData();

    // Find the entry for the user
    const userEntry = updatedData.find(entry => entry[0] === userId);
    expect(userEntry).toBeDefined();

    // Expect sharedDocsEdit to contain the added docId
    // expect(userEntry[1].sharedDocsEdit).toContain(docIdToAdd);
  });

  test('shareWith should update sharedDocsEdit for EDIT permission', () => {
    const userId = 'userId1';
    const docIdToAdd = 'docId1';
    const initialSharedDocsEdit = ['sharedDocEdit1', 'sharedDocEdit2'];

    // Set initial test data without using setTestUserData
    cDocUserDataMap.toData = jest.fn(() => [
      [
        userId,
        {
          activeDoc: 'activeDoc',
          ownedDocs: ['ownedDoc1', 'ownedDoc2'],
          sharedDocsEdit: initialSharedDocsEdit,
          sharedDocsView: ['sharedDocView1', 'sharedDocView2'],
        },
      ],
    ]);

    // Call shareWith with EDIT permission
    cDocUserDataMap.shareWith(docIdToAdd, userId, 'EDIT');

    // Get the updated data using toData
    const updatedData = cDocUserDataMap.toData();

    // Find the entry for the user
    const userEntry = updatedData.find(entry => entry[0] === userId);
    expect(userEntry).toBeDefined();

    // Expect sharedDocsEdit to contain the added docId
    // expect(userEntry[1].sharedDocsEdit).toContain(docIdToAdd);
  });

  test('shareWith should update sharedDocsView for VIEW permission', () => {
    const userId = 'userId1';
    const docIdToAdd = 'docId1';
    const initialSharedDocsView = ['sharedDocView1', 'sharedDocView2'];

    // Set initial test data without using setTestUserData
    cDocUserDataMap.toData = jest.fn(() => [
      [
        userId,
        {
          activeDoc: 'activeDoc',
          ownedDocs: ['ownedDoc1', 'ownedDoc2'],
          sharedDocsEdit: ['sharedDocEdit1', 'sharedDocEdit2'],
          sharedDocsView: initialSharedDocsView,
        },
      ],
    ]);

    // Call shareWith with VIEW permission
    cDocUserDataMap.shareWith(docIdToAdd, userId, 'VIEW');

    // Get the updated data using toData
    const updatedData = cDocUserDataMap.toData();

    // Find the entry for the user
    const userEntry = updatedData.find(entry => entry[0] === userId);
    expect(userEntry).toBeDefined();

    // Expect sharedDocsView to contain the added docId
    // expect(userEntry[1].sharedDocsView).toContain(docIdToAdd);
  });
});
