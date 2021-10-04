import { AuthResult } from '@sotaoi/omni/transactions';
import { AuthCommand } from '@sotaoi/api/commands';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { Helper } from '@sotaoi/api/helper';
import { UserModel } from '@app/api/models/user-model';
import { storeAuthorization } from '@sotaoi/api/auth/oauth-authorize';
import { ErrorCode } from '@sotaoi/omni/errors';

class AuthUserHandler extends AuthHandler {
  public getFormId = async (): Promise<string> => 'auth-user-form';

  public async model(): Promise<UserModel> {
    return new UserModel();
  }

  public async handle(command: AuthCommand): Promise<AuthResult> {
    const user = await new UserModel()
      .mdb()
      .where('email', command.payload.email.serialize(true))
      .where('password', Helper.sha1(command.payload.password.serialize(true)))
      .first();
    if (!user) {
      return new AuthResult(401, ErrorCode.APP_GENERIC_ERROR, 'Error', 'Invalid credentials', null, null, null, {});
    }

    const accessToken = Helper.uuid();
    // todo lowprio: better token encryption needed here
    const authRecord = this.mdriverAuthRecord('user', user.uuid, user.createdAt, true, {});
    const rememberMe = command.payload.rememberMe.serialize(true);
    const tokenTtl = rememberMe ? AuthHandler.getTokenTtlInSeconds() : AuthHandler.getShortTokenTtlInSeconds();

    if (
      !(await storeAuthorization(
        'user',
        this.handler,
        authRecord,
        this.mdriverDomainRepoSignature('user'),
        accessToken,
        rememberMe,
        tokenTtl,
      ))
    ) {
      return new AuthResult(
        400,
        ErrorCode.APP_GENERIC_ERROR,
        'Error',
        'Credentials look good, but authorization server failed',
        authRecord,
        accessToken,
        null,
        {},
      );
    }

    return new AuthResult(200, null, 'Success', 'Authentication success', authRecord, accessToken, null, {});
  }
}

export { AuthUserHandler };
