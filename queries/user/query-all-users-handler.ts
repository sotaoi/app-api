import { FlistQueryHandler } from '@sotaoi/api/queries/query-handlers';
import { QueryResult, FlistQuery } from '@sotaoi/omni/transactions';
import { UserModel } from '@app/api/models/user-model';
import { Model } from '@sotaoi/api/db/model';
import { logger } from '@sotaoi/api/logger';

class QueryAllUsersHandler extends FlistQueryHandler {
  public async model(): Promise<Model> {
    return new UserModel();
  }

  public async handle(query: FlistQuery): Promise<QueryResult> {
    if (!(await this.requireArtifact(query.authRecord).ofType('user'))) {
      return new QueryResult(401, 'Unauthorized', 'No authorization to run query', null, null);
    }

    try {
      const users = await new UserModel().mdb().orderBy('createdAt', 'DESC');
      return new QueryResult(200, 'Query success', 'Query was successful', await this.transform(users, null), null);
    } catch (err) {
      logger().estack(err);
      return new QueryResult(400, 'Error', 'Query failed', null, null);
    }
  }
}

export { QueryAllUsersHandler };
