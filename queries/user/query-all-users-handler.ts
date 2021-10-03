import { FlistQueryHandler } from '@sotaoi/api/queries/query-handlers';
import { QueryResult, FlistQuery } from '@sotaoi/omni/transactions';
import { UserModel } from '@app/api/models/user-model';
import { Model } from '@sotaoi/api/db/model';
import { logger } from '@sotaoi/api/logger';
import { ErrorCode } from '@sotaoi/omni/errors';

class QueryAllUsersHandler extends FlistQueryHandler {
  public async model(): Promise<Model> {
    return new UserModel();
  }

  public async handle(query: FlistQuery): Promise<QueryResult> {
    if (!(await this.requireArtifact(query.authRecord).ofType('user'))) {
      return new QueryResult(
        401,
        ErrorCode.APP_GENERIC_ERROR,
        'Unauthorized',
        'No authorization to run query',
        null,
        null,
        {},
      );
    }

    try {
      const users = await new UserModel().mdb().orderBy('createdAt', 'DESC');
      return new QueryResult(
        200,
        null,
        'Query success',
        'Query was successful',
        await this.transform(users, null),
        null,
        {},
      );
    } catch (err) {
      logger().estack(err);
      return new QueryResult(400, ErrorCode.APP_GENERIC_ERROR, 'Error', 'Query failed', null, null, {});
    }
  }
}

export { QueryAllUsersHandler };
