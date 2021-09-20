import { logger } from '@sotaoi/api/logger';
import { RecordEntry, AuthRecord } from '@sotaoi/omni/artifacts';
import { UserModel } from '@app/api/models/user-model';
import { GenericModel } from '@sotaoi/api/db/generic-model';
import { Helper } from '@sotaoi/api/helper';
import { ResponseToolkit } from '@hapi/hapi';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import nodeFetch from 'node-fetch';
import { Store } from '@sotaoi/api/store';
import { getAppDomain } from '@sotaoi/omni/get-app-info';
import { config } from '@sotaoi/api/config';
import { ScopedRequests } from '@sotaoi/omni/transactions';

const oauthAuthorize = async (requestBody: any): Promise<null | { scope: string; user: RecordEntry }> => {
  try {
    const userm = new UserModel();
    if (typeof requestBody !== 'object') {
      throw new Error('Unknown request body type');
    }
    const { scope, username, password } = requestBody;

    const _scopedRequests = scopedRequests();
    if (Object.keys(_scopedRequests || []).indexOf(scope) === -1) {
      return null;
    }

    const user = (await userm.mdb().where('email', username).where('password', password).first()) || null;
    if (user) {
      return { scope, user: await userm.transform(user, null) };
    }
    return null;
  } catch (err) {
    logger().estack(err);
    return null;
  }
};

const storeAuthorization = async (
  handler: ResponseToolkit,
  authRecord: AuthRecord,
  userSignature: string,
  accessToken: string,
  rememberMe: boolean,
  tokenTtl: number,
): Promise<boolean> => {
  const accessTokenUuid = Helper.uuid();
  const cleanupAccessToken = async () => {
    try {
      await new GenericModel('access_token').mdb().where('uuid', accessTokenUuid).delete();
    } catch (err) {
      logger().estack(err);
    }
  };
  await new GenericModel('access_token').mdb().insert({
    uuid: accessTokenUuid,
    authRecordSerial: authRecord.serial,
    token: accessToken,
    rememberMe,
    expiresAt: Helper.addSeconds(new Date(), tokenTtl),
  });
  const userTokenObtained = !!(await obtainUserToken(userSignature, authRecord.uuid, '@#'));
  if (!userTokenObtained) {
    await cleanupAccessToken();
    return false;
  }
  AuthHandler.saveAccessToken(handler, accessToken, tokenTtl);
  return true;
};

const obtainUserToken = async (
  userSignature: string,
  userUuid: string,
  scope: string,
  iteration = 0,
): Promise<null | string> => {
  if (iteration > 16) {
    return null;
  }

  const oneMinuteAgo = new Date();
  oneMinuteAgo.setTime(new Date().getTime() - 1 * 60 * 1000);
  await new GenericModel('oauth_user_token')
    .mdb()
    .whereNull('oauthTokenUuid')
    .where('createdAt', '<', oneMinuteAgo)
    .delete();

  const userHasToken =
    (await new GenericModel('oauth_user_token')
      .mdb()
      .where('userSignature', userSignature)
      .where('userUuid', userUuid)
      .where('scope', scope)
      .first()) || null;

  if (!userHasToken) {
    const storedOauthUserTokenUuid = Helper.uuid();
    const cleanupFailedOauthUserToken = async () => {
      try {
        await new GenericModel('oauth_user_token').mdb().where('uuid', storedOauthUserTokenUuid).delete();
      } catch (err) {
        logger().estack(err);
      }
    };

    await new GenericModel('oauth_user_token').mdb().insert({
      uuid: storedOauthUserTokenUuid,
      userSignature,
      userUuid,
      scope,
      oauthTokenUuid: null,
    });

    const user = (await new UserModel().mdb().where('uuid', userUuid).first()) || null;
    if (!user) {
      await cleanupFailedOauthUserToken();
      throw new Error('Failed to find user');
    }

    const appInfo = Store.getAppInfo();
    const oauthUrl = `https://${getAppDomain(require('dotenv'))}/${Helper.ltrim('/', appInfo.oauthPrefix)}`;
    try {
      const authorizationCode =
        (
          await (
            await nodeFetch(`${oauthUrl}/authorize`, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              method: 'POST',
              body: [
                `client_id=${encodeURIComponent(appInfo.bundleUid)}`,
                `redirect_uri=${encodeURIComponent('https://localhost/no/redirect')}`,
                `response_type=${encodeURIComponent('code')}`,
                `grant_type=${encodeURIComponent('authorization_code')}`,
                `state=${encodeURIComponent('noState')}`,
                `username=${encodeURIComponent(user.email)}`,
                `password=${encodeURIComponent(user.password)}`,
                `scope=${encodeURIComponent('@#')}`,
              ].join('&'),
            })
          ).json()
        )?.result?.code || null;

      if (!authorizationCode) {
        await cleanupFailedOauthUserToken();
        return null;
      }

      const oauthSecret = config('app.oauth_secret');
      const accessToken =
        (
          await (
            await nodeFetch(`${oauthUrl}/token`, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              method: 'POST',
              body: [
                `client_id=${encodeURIComponent(appInfo.bundleUid)}`,
                `client_secret=${encodeURIComponent(oauthSecret)}`,
                `redirect_uri=${encodeURIComponent('https://localhost/no/redirect')}`,
                `code=${encodeURIComponent(authorizationCode)}`,
                `grant_type=${encodeURIComponent('authorization_code')}`,
                `state=${encodeURIComponent('noState')}`,
              ].join('&'),
            })
          ).json()
        )?.access_token || null;
      if (!accessToken) {
        await cleanupFailedOauthUserToken();
        throw new Error('Failed to generate OAuth2 access token');
      }

      const oauthTokenRecord =
        (await new GenericModel('oauth_token').mdb().where('scope', scope).where('accessToken', accessToken).first()) ||
        null;
      if (!oauthTokenRecord) {
        await cleanupFailedOauthUserToken();
        throw new Error('Failed to retrieve OAuth2 access token');
      }
      await new GenericModel('oauth_user_token')
        .mdb()
        .where('userSignature', userSignature)
        .where('userUuid', userUuid)
        .where('scope', scope)
        .update({
          oauthTokenUUid: oauthTokenRecord.uuid,
        });

      return accessToken;
    } catch (err) {
      logger().estack(err);
      await cleanupFailedOauthUserToken();
      return null;
    }
  }

  const user = (await new UserModel().mdb().where('uuid', userUuid).first()) || null;
  if (!user) {
    throw new Error('Failed to find user');
  }

  const oauthUserToken =
    userHasToken ||
    (await new GenericModel('oauth_user_token')
      .mdb()
      .where('userSignature', userSignature)
      .where('userUuid', userUuid)
      .where('scope', scope)
      .first()) ||
    null;
  if (!oauthUserToken) {
    throw new Error('Something went wrong, no "oauth_user_token" record for given user');
  }
  if (!oauthUserToken.oauthTokenUuid) {
    await Helper.pause(300);
    return await obtainUserToken(userSignature, userUuid, scope, iteration + 1);
  }

  const oauthToken =
    (await new GenericModel('oauth_token').mdb().where('uuid', oauthUserToken.oauthTokenUuid).first()) || null;
  if (!oauthToken) {
    throw new Error('Something went wrong, no "oauth_token" record for given user');
  }
  if (oauthToken.accessTokenExpiresAt.getTime() < new Date().getTime()) {
    await deauthorizeUserToken(userSignature, userUuid, scope);
    return await obtainUserToken(userSignature, userUuid, scope, iteration + 1);
  }

  return oauthToken.accessToken;
};

const scopedRequests = (): null | ScopedRequests => {
  return {
    '@#': async () => {
      return { ok: true };
    },
    testscope: async (data: { [key: string]: any }) => {
      return { ok: true, test: true, data };
    },
  };
};

const deauthorizeUserToken = async (userSignature: string, userUuid: string, scope: string): Promise<void> => {
  const oauthUserToken =
    (await new GenericModel('oauth_user_token')
      .mdb()
      .where('userSignature', userSignature)
      .where('userUuid', userUuid)
      .where('scope', scope)
      .first()) || null;
  if (oauthUserToken && oauthUserToken.oauthTokenUuid) {
    await new GenericModel('oauth_user_token').mdb().where('uuid', oauthUserToken.uuid).delete();
    await new GenericModel('oauth_token').mdb().where('uuid', oauthUserToken.oauthTokenUuid).delete();
    return;
  }
  await new GenericModel('oauth_user_token').mdb().where('uuid', oauthUserToken.uuid).delete();
};

const verifyToken = async (oauthAccessToken: null | string, scope: string): Promise<boolean> => {
  try {
    if (typeof oauthAccessToken !== 'string') {
      return false;
    }
    oauthAccessToken = oauthAccessToken.replace('Bearer ', '');
    const oauthAccessTokenRecord = await new GenericModel('oauth_token')
      .mdb()
      .where('scope', scope)
      .where('accessToken', oauthAccessToken)
      .first();
    if (!oauthAccessTokenRecord) {
      return false;
    }
    const appInfo = Store.getAppInfo();
    const oauthUrl = `https://${getAppDomain(require('dotenv'))}/${Helper.ltrim('/', appInfo.oauthPrefix)}`;
    return !!(
      await (
        await nodeFetch(`${oauthUrl}/verify`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Bearer ' + oauthAccessToken,
          },
          method: 'POST',
          body: '',
        })
      ).json()
    )?.success;
  } catch (err) {
    logger().estack(err);
    return false;
  }
};

export { oauthAuthorize, storeAuthorization, obtainUserToken, scopedRequests, deauthorizeUserToken, verifyToken };
