import {
  CDocDocID,
  CDocUserID,
  ExtendedPermissionType,
  ICDocUserDataMap,
  PermissionType,
} from '../types/CoveyTownSocket';

interface CDocUserData {
  activeDoc: CDocDocID | undefined;
  ownedDocs: CDocDocID[];
  sharedDocsEdit: CDocDocID[];
  sharedDocsView: CDocDocID[];
}
export class CDocUserDataMap implements ICDocUserDataMap {
  public isTrackingDoc(docid: string): boolean {
    if (!docid) throw new Error('Given null string in isTrackingDoc');

    return this._docMap.find(entry => entry[1].activeDoc === docid) !== undefined;
  }

  public isTrackingUser(userID: CDocUserID): boolean {
    return this._docMap.find(entry => entry[0] === userID) !== undefined;
  }

  private _docMap: [CDocUserID, CDocUserData][];

  constructor() {
    this._docMap = [];
  }

  public getSharedDocs(userID: string, permissionType: PermissionType): CDocDocID[] {
    const foundEntry = this._docMap.find(entry => entry[0] === userID);

    if (foundEntry) {
      if (permissionType === 'EDIT') {
        return foundEntry[1].sharedDocsEdit;
      }
      if (permissionType === 'VIEW') {
        return foundEntry[1].sharedDocsView;
      }
    }
    throw new Error('getSharedDocs failed');
  }

  public hasActiveDoc(userid: CDocUserID): boolean {
    // if (!userid) throw new Error('Given null string in hasActiveDoc');
    return this._docMap.find(entry => entry[0] === userid) !== undefined;
  }

  public getActiveDoc(userid: CDocUserID): CDocDocID {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry && foundEntry[1].activeDoc) return foundEntry[1].activeDoc;
    throw new Error('User has no active doc');
  }

  public closeActiveDoc(userid: CDocUserID) {
    this.setActiveDoc(userid, undefined);
  }

  public setActiveDoc(userid: CDocUserID, docid: CDocDocID | undefined) {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry)
      this._setUserData(
        userid,
        docid,
        foundEntry[1].ownedDocs,
        foundEntry[1].sharedDocsEdit,
        foundEntry[1].sharedDocsView,
      );
    else this._setUserData(userid, docid, [], [], []);
  }

  public setOwnedDocs(userid: CDocUserID, docs: CDocDocID[]) {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry)
      this._setUserData(
        userid,
        foundEntry[1].activeDoc,
        docs,
        foundEntry[1].sharedDocsEdit,
        foundEntry[1].sharedDocsView,
      );
    else this._setUserData(userid, undefined, docs, [], []);
  }

  public getOwnedDocs(userid: CDocUserID): CDocDocID[] {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry) return foundEntry[1].ownedDocs;
    throw new Error('User not found');
  }

  public getOwnedDocsOrDefault(userid: CDocUserID): CDocDocID[] {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry) return foundEntry[1].ownedDocs;
    return [];
  }

  /**
   * Share the given doc with the given person by modifying their list of shared with me documents.
   * @param docID
   * @param userID
   * @param permissionType
   */
  public shareWith(docID: CDocDocID, userID: CDocUserID, permissionType: ExtendedPermissionType) {
    const foundEntry = this._docMap.find(entry => entry[0] === userID);

    if (foundEntry) {
      if (permissionType === 'REMOVE') {
        this._setUserData(
          userID,
          foundEntry[1].activeDoc,
          foundEntry[1].ownedDocs,
          foundEntry[1].sharedDocsEdit.filter(user => user !== userID),
          foundEntry[1].sharedDocsView.filter(user => user !== userID),
        );
      } else {
        this._setUserData(
          userID,
          foundEntry[1].activeDoc,
          foundEntry[1].ownedDocs,
          foundEntry[1].sharedDocsEdit.concat(permissionType === 'EDIT' ? [docID] : []),
          foundEntry[1].sharedDocsView.concat(permissionType === 'VIEW' ? [docID] : []),
        );
      }
    }
    throw new Error('User not found');
  }

  private _setUserData(
    userid: CDocUserID,
    activeDoc: CDocDocID | undefined,
    ownedDocs: CDocDocID[],
    sharedEdit: CDocDocID[],
    sharedView: CDocDocID[],
  ) {
    this._docMap = this._docMap.filter(entry => entry[0] !== userid);
    const newData: CDocUserData = {
      activeDoc,
      ownedDocs,
      sharedDocsEdit: sharedEdit,
      sharedDocsView: sharedView,
    };
    this._docMap.push([userid, newData]);
  }
}

export default CDocUserDataMap;
