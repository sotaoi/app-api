import { RetrieveHandler } from '@sotaoi/api/queries/retrieve-handler';
import { RetrieveResult } from '@sotaoi/omni/transactions';
import { Retrieve } from '@sotaoi/omni/transactions';
import { UserModel } from '@app/api/models/user-model';
import { logger } from '@sotaoi/api/logger';
import { NotFoundError } from '@app/api/errors/errors';

class RetrieveUserHandler extends RetrieveHandler {
  public async model(): Promise<UserModel> {
    return new UserModel();
  }

  public async handle(retrieve: Retrieve): Promise<RetrieveResult> {
    try {
      if (!(await this.requireArtifact(retrieve.authRecord).ofType('user'))) {
        return new RetrieveResult(401, 'Unauthorized', 'No authorization to run query', null, null, {});
      }

      const user = await new UserModel().mdb().where('uuid', retrieve.uuid).first();

      if (!user) {
        const error = new NotFoundError('Retrieve failed');
        error.message = 'Not found';
        throw error;
      }

      const result = new RetrieveResult(
        200,
        'Retrieve success',
        'Retrieve was successful',
        await this.transform(user, retrieve.variant),
        null,
        {},
      );

      return result;
    } catch (err) {
      logger().estack(err);
      return new RetrieveResult(
        err && err.code ? err.code : 400,
        err && err.name ? err.name : 'Error',
        err && err.message ? err.message : 'Retrieve failed',
        null,
        null,
        {},
      );
    }
  }
}

export { RetrieveUserHandler };
