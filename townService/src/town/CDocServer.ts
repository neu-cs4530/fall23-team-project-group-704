import { CDocDocID, ICDocDocument } from '../types/CoveyTownSocket';
import Document from '../api/document';
import appDataSource from '../api/datasource';

// TODO: change ids from numbers to right type
/** We will do all operations directly to database for now. */
export default class CDocServer {
  async getOwnedDocs(docid: CDocDocID): Promise<CDocDocID[]> {
    const docs = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Document, 'doc')
      .where('doc.id = :id', { id: docid })
      .getMany();
    return docs.map(doc => String(doc.id));
  }

  public loadIfNotLoaded(docid: CDocDocID) {
    throw new Error('Not implemented');
  }

  public async writeToDoc(docid: CDocDocID, content: string) {
    await appDataSource
      .createQueryBuilder()
      .update(Document)
      .set({ data: content })
      .where('id = :id', { id: docid })
      .execute();
  }

  public async getDoc(docid: CDocDocID): Promise<ICDocDocument> {
    const document = await appDataSource
      .createQueryBuilder()
      .select('doc')
      .from(Document, 'doc')
      .where('doc.id = :id', { id: docid })
      .getOne();

    if (document === null) {
      throw new Error();
    } else {
      const doc: ICDocDocument = {
        createdBy: document.userId,
        owner: '',
        boardID: String(document.id),
        boardName: document.userId,
        editors: document.allowedUsersEdit,
        viewers: document.allowedUsersView,
        content: document.data,
      };
      return doc;
    }
  }
}
