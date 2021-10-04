import { AppKernel } from '@sotaoi/api/app-kernel';
import { config } from '@sotaoi/api/config';
import { Output } from '@sotaoi/api/output';
import {
  StringInput,
  NumberInput,
  RefSelectInput,
  FileInput,
  MultiFileInput,
  StringSelectInput,
  OptionsSelectInput,
  BooleanInput,
} from '@sotaoi/omni/input';
import { AuthRecord } from '@sotaoi/omni/artifacts';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { ResponseToolkit } from '@hapi/hapi';
import { GenericModel } from '@sotaoi/api/db/generic-model';
import { Store } from '@sotaoi/api/store';
import { obtainUserToken, verifyToken } from '@sotaoi/api/auth/oauth-authorize';

class ApiInit {
  // { -->
  private static _kernel: null | AppKernel = null;

  // app kernel
  public static kernel(): AppKernel {
    if (!ApiInit._kernel) {
      ApiInit._kernel = new AppKernel(config);
    }
    return ApiInit._kernel;
  }

  // for automatic payload deserialization
  public static registerInputs(): void {
    Output.registerInput(StringInput);
    Output.registerInput(NumberInput);
    Output.registerInput(FileInput);
    Output.registerInput(MultiFileInput);
    Output.registerInput(RefSelectInput);
    Output.registerInput(StringSelectInput);
    Output.registerInput(OptionsSelectInput);
    Output.registerInput(BooleanInput);
  }

  // set auth handler token ttl in milliseconds
  public static setTokenTtlInMilliseconds(tokenTtl: number, shortTokenTtl: number): void {
    AuthHandler.setTokenTtlInMilliseconds(tokenTtl);
    AuthHandler.setShortTokenTtlInMilliseconds(shortTokenTtl);
  }
  // translate access token
  public static async translateAccessToken(
    handler: ResponseToolkit,
    accessToken: null | string,
  ): Promise<[null | AuthRecord, null | string]> {
    const accessTokenInState = AuthHandler.getAccessToken(handler);
    if (!accessToken || typeof accessToken !== 'string' || accessTokenInState !== accessToken) {
      return [null, null];
    }
    const accessTokenRecord = await new GenericModel('access_token')
      .mdb()
      .where('token', accessToken)
      .where('expiresAt', '>', new Date())
      .first();
    if (!accessTokenRecord) {
      return [null, null];
    }
    const authRecord = AuthRecord.deserialize(accessTokenRecord.authRecordSerial);
    if (authRecord.domainSignature !== Store.mdriverDomainSignature()) {
      return [null, null];
    }
    const record = await new GenericModel(authRecord.repository).mdb().where('uuid', authRecord.uuid).first();
    if (!record) {
      return [null, null];
    }

    const oauthAccessToken = await obtainUserToken(
      'user',
      Store.mdriverDomainRepoSignature('user'),
      authRecord.uuid,
      '@#',
    );

    if (!oauthAccessToken) {
      return [null, null];
    }
    if (!(await verifyToken(oauthAccessToken, '@#'))) {
      return [null, null];
    }

    return [
      new AuthRecord(authRecord.domainSignature, authRecord.repository, record.uuid, record.createdAt, true, {}),
      accessToken,
    ];
  }

  // deauth
  public static async deauth(handler: ResponseToolkit): Promise<void> {
    const accessToken = AuthHandler.getAccessToken(handler);
    if (accessToken) {
      await new GenericModel('access_token').mdb().where('token', accessToken).delete();
    }
    AuthHandler.removeAccessToken(handler);
  }

  // <-- }
}

export { ApiInit };
