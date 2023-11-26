import { CDocDocID, CDocUserID, ICDocUserDataMap } from '../types/CoveyTownSocket';

interface CDocUserData {
  activeDoc: CDocDocID | undefined;
  ownedDocs: CDocDocID[];
}
export class CDocUserDataMap implements ICDocUserDataMap {
  public isTrackingDoc(docid: string): boolean {
    if (!docid) throw new Error('Given null string in isTrackingDoc');

    return this._docMap.find(entry => entry[1].activeDoc === docid) !== undefined;
  }

  private _docMap: [CDocUserID, CDocUserData][];

  constructor() {
    this._docMap = [];
  }

  public hasActiveDoc(userid: CDocUserID): boolean {
    if (!userid) throw new Error('Given null string in hasActiveDoc');
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

    if (foundEntry) this._setUserData(userid, docid, foundEntry[1].ownedDocs);
    else this._setUserData(userid, docid, []);
  }

  public setOwnedDocs(userid: CDocUserID, docs: CDocDocID[]) {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry) this._setUserData(userid, foundEntry[1].activeDoc, docs);
    else this._setUserData(userid, undefined, docs);
  }

  public getOwnedDocs(userid: CDocUserID): CDocDocID[] {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry && foundEntry[1].activeDoc) return foundEntry[1].ownedDocs;
    throw new Error('User has no active doc');
  }

  public getOwnedDocsOrDefault(userid: CDocUserID): CDocDocID[] {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry && foundEntry[1].activeDoc) return foundEntry[1].ownedDocs;
    return [];
  }

  private _setUserData(
    userid: CDocUserID,
    activeDoc: CDocDocID | undefined,
    ownedDocs: CDocDocID[],
  ) {
    this._docMap.filter(entry => entry[0] !== userid);
    this._docMap.push([userid, { activeDoc, ownedDocs }]);
  }
}

export default CDocUserDataMap;
