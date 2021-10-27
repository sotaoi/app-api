import { FlistQueryHandler } from '@sotaoi/api/queries/query-handlers';
import { QueryResult, FlistQuery } from '@sotaoi/omni/transactions';
import { Model } from '@sotaoi/api/db/model';
declare class QueryAllUsersHandler extends FlistQueryHandler {
    model(): Promise<Model>;
    handle(query: FlistQuery): Promise<QueryResult>;
}
export { QueryAllUsersHandler };
