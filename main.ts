require('dotenv').config();
import fs from 'fs';
import path from 'path';
import { Store } from '@sotaoi/api/store';
import { Server } from '@sotaoi/api/server';
import { handlers } from '@app/api/handlers';
import { user } from '@sotaoi/omni/forms/user-forms';
import { ApiInit } from '@app/api/api-init';
import { UserModel } from '@app/api/models/user-model';
import { connect, mconnect, sconnect } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';
import { Helper } from '@sotaoi/api/helper';
import { Server as HttpsServer } from 'https';
import { Server as HttpServer } from 'http';
import { AuthHandler } from '@sotaoi/api/commands/auth-handler';
import { getAppInfo } from '@sotaoi/omni/get-app-info';
import { oauthAuthorize, scopedRequests, verifyToken } from '@app/api/auth/oauth-authorize';

let serverInitInterval: any = null;
let serverInitTries = 0;

let servers: (HttpsServer | HttpServer)[] = [];

let exitHandled = false;
process.stdin.resume();
const exitHandler = () => {
  if (exitHandled) {
    return;
  }
  exitHandled = true;
  Helper.shutDown(servers, logger);
};
process.on('exit', exitHandler.bind(null, { code: 0 }));
process.on('SIGINT', exitHandler.bind(null, { code: 0 }));
process.on('SIGTERM', exitHandler.bind(null, { code: 0 }));
process.on('SIGQUIT', exitHandler.bind(null, { code: 0 }));
process.on('SIGUSR1', exitHandler.bind(null, { code: 0 }));
// process.on('SIGUSR2', exitHandler.bind(null, { code: 0 })); // <-- this is nodemon
// process.on('uncaughtException', exitHandler.bind(null, { code: 1 })); // <-- you don't want shutdown on uncaughtException

const main = async (noServer: boolean): Promise<void> => {
  clearTimeout(serverInitInterval);

  const keyPath = path.resolve(process.env.SSL_KEY || '');
  const certPath = path.resolve(process.env.SSL_CERT || '');
  const chainPath = path.resolve(process.env.SSL_CA || '');
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

  appKernel.bootstrap();

  AuthHandler.setTranslateAccessToken(ApiInit.translateAccessToken);
  AuthHandler.setDeauth(ApiInit.deauth);

  const appInfo = getAppInfo(require('dotenv'));
  await Store.init(appInfo, handlers, { user }, scopedRequests());

  // start
  const server = await Server.init(noServer, oauthAuthorize, verifyToken);
  server && servers.push(server);
};

export { main };
