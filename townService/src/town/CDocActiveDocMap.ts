import { CDocDocID, CDocUserID } from '../types/CoveyTownSocket';

class CDocActiveDocMap {
  private _docMap: [CDocUserID, CDocDocID][];

  constructor() {
    this._docMap = [];
  }

  hasActiveDoc(userid: CDocUserID): boolean {
    return this._docMap.find(entry => entry[0] === userid) !== undefined;
  }

  getActiveDoc(userid: CDocUserID): CDocDocID {
    const foundEntry = this._docMap.find(entry => entry[0] === userid);

    if (foundEntry) return foundEntry[1];
    throw new Error('User has no active doc');
  }

  closeActiveDoc(userid: CDocUserID) {
    if (!this.hasActiveDoc(userid)) throw new Error('User has no active doc');
    this._docMap.filter(entry => entry[0] !== userid);
  }

  setActiveDoc(userid: CDocUserID, docid: CDocDocID) {
    if (this.hasActiveDoc(userid)) this.closeActiveDoc(userid);

    this._docMap.push([userid, docid]);
  }
}

export default CDocActiveDocMap;
