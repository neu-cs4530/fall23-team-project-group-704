import { CovDocDocID, ICDocDocument } from '../types/CoveyTownSocket';

export default class CDocServer {
  getOwnedDocs(docid: CovDocDocID): CovDocDocID[] {
    throw new Error('Method not implemented.');
  }

  public loadIfNotLoaded(docid: CovDocDocID) {}

  public writeToDoc(docid: CovDocDocID, content: string) {}

  public getDoc(docid: CovDocDocID): ICDocDocument {
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
