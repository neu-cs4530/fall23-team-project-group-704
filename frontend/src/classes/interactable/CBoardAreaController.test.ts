import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';

// TODO: someone write the implementation of this and remove this stub
// Feel free to modify the design, this is a very early idea.
// I also combined the methods from DirectoryController into here
// based on Aminah's idea, feel free to modify.
class CBoardAreaController {
  /**
   * Returns true if the user id and password match an existing user,
   * or false if they don't. If they match, the controller switches to
   * signed in mode, allowing more methods to be called such as adding documents.
   * @param user_id
   * @param password
   * @returns
   */
  // TODO: create type for user ids
  // TODO: what if this returned a ValidatedCBoardAreaController
  // which contains methods only available to validated users?
  validatePastUser(user_id: string, password: string): boolean {
    return false;
  }

  /**
   * Creates a new user with the given user name or password.
   * Throws exception if the user name is already taken.
   * @param user_id
   * @param password
   */
  createNewUser(user_id: string, password: string) {}

  /**
   * Creates a new document in the document directory, returning
   * the new id.
   * Throws exception if not signed in.
   * @returns
   */
  // TODO: make custom type for doc_id
  addNewDocument(): string {
    return '';
  }

  openDocument() {}

  closeDocument() {}
}

describe('[T2] CBoardAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: CBoardAreaController;
  beforeEach(() => {
    testArea = new CBoardAreaController();
  });
  describe('validatePastUser', () => {
    it('returns true if username and password match', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(true);
    });
    it('allows all methods to be used once validation is successful', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(true);
      // hopefully no exceptions will be thrown when the following methods are called
      testArea.addNewDocument();
      testArea.closeDocument();
      testArea.openDocument();
    });
    it('returns false if username and password do not match', () => {
      // somehow set up an existing list of users for testArea
      expect(testArea.validatePastUser('', '')).toEqual(false);
    });
  });
  describe('createNewUser', () => {
    it('creates new user if user does not currently exist', () => {
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(false);
      testArea.createNewUser('tester', 'passcode');
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(true);
    });
    it('throws exception if user name is already taken', () => {
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(false);
      testArea.createNewUser('tester', 'passcode');
      expect(testArea.validatePastUser('tester', 'passcode')).toEqual(true);

      // now try creating the user again
      expect(() => testArea.createNewUser('tester', 'passcode_')).toThrow(Error());
    });
  });
  describe('addNewDocument', () => {
    it('throws exception if not signed in', () => {
      expect(() => testArea.addNewDocument()).toThrow(new Error());
    });
  });
});
