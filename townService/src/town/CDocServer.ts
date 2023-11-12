import { CDocDocID, ICDocDocument } from '../types/CoveyTownSocket';

export default class CDocServer {
  getOwnedDocs(docid: CDocDocID): CDocDocID[] {
    throw new Error('Method not implemented.');
  }

  public loadIfNotLoaded(docid: CDocDocID) {}

  public writeToDoc(docid: CDocDocID, content: string) {}

  public getDoc(docid: CDocDocID): ICDocDocument {
    const doc: ICDocDocument = {
      createdBy: '',
      owner: '',
      boardID: '',
      boardName: '',
      editors: [],
      viewers: [],
      content: '',
    };
    return doc;
  }
}
