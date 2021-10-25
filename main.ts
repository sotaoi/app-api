import type { Server as HttpsServer } from 'https';
import type { Server as HttpServer } from 'http';
import fs from 'fs';
import { Store } from '@sotaoi/api/store';
import { Server } from '@sotaoi/api/server';
import { handlers } from '@app/api/handlers';
import { user } from '@app/omni/forms/user-forms';
import { ApiInit } from '@app/api/api-init';
import { UserModel } from '@app/api/models/user-model';
import { connect, mconnect, sconnect } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { getAppInfo } from '@sotaoi/omni/get-app-info';
import { scopedRequests } from '@sotaoi/api/auth/oauth-authorize';
import { config, env } from '@app/omni/config';

let server: null | HttpsServer | HttpServer = null;
let serverInitInterval: any = null;
let serverInitTries = 0;

const main = async (noServer: boolean): Promise<void> => {
  clearTimeout(serverInitInterval);

  const appInfo = getAppInfo();

  const keyPath = require.resolve(appInfo.sslKey);
  const certPath = require.resolve(appInfo.sslCert);
  const chainPath = require.resolve(appInfo.sslCa);
  if (!noServer && (!fs.existsSync(keyPath) || !fs.existsSync(certPath) || !fs.existsSync(chainPath))) {
    if (serverInitTries === 60) {
      console.error('server failed to start because at least one ssl certificate file is missing');
      return;
    }
    serverInitTries++;
    console.warn('at least one certificate file is missing. retrying in 5 seconds...');
    serverInitInterval = setTimeout(async (): Promise<void> => {
      await main(false);
    }, 5000);
    return;
  }

  // app kernel
  const appKernel = ApiInit.kernel();

  // for automatic payload deserialization
  ApiInit.registerInputs();

  // set token ttl in milliseconds
  ApiInit.setTokenTtlInMilliseconds(14 * 24 * 60 * 60 * 1000, 0.5 * 24 * 60 * 60 * 1000);

  // models
  const models = [new UserModel()];
  models.map((model) => logger().notice(`Acknowledging model ${model.repository()}`));

  await connect();
  await mconnect();
  await sconnect();

  appKernel.bootstrap(config);

  AuthHandler.setTranslateAccessToken(ApiInit.translateAccessToken);
  AuthHandler.setDeauth(ApiInit.deauth);

  await Store.init(appInfo, handlers, { user }, scopedRequests());

  // start
  server = await Server.init(noServer, { key: keyPath, ca: chainPath, cert: certPath, rejectUnauthorized: false });
};

export { main };
