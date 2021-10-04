#!/usr/bin/env node

import path from 'path';
import _package from '@app/api/package.json';
import { getAppInfo } from '@sotaoi/omni/get-app-info';
import fs from 'fs';
import { express } from '@sotaoi/api/express';
import { Helper } from '@sotaoi/api/helper';
import { Server as HttpServer } from 'http';
import https from 'https';

const Greenlock = require('greenlock');

let _checkCertificatesInterval: any = null;

const servers: (https.Server | HttpServer)[] = [];
const appInfo = getAppInfo();

const getTimestamp = Helper.getTimestamp;
const shutDown = Helper.shutDown;

process.on('SIGTERM', () => {
  shutDown(servers, null);
});
process.on('SIGINT', () => {
  shutDown(servers, null);
});
process.on('SIGQUIT', () => {
  shutDown(servers, null);
});

const altnames =
  process.env.NODE_ENV === 'production'
    ? [
        appInfo.prodDomain,
        ...[appInfo.prodDomainAlias].filter((domain: string) => domain !== appInfo.prodDomain && domain),
      ]
    : process.env.NODE_ENV === 'staging'
    ? [
        appInfo.stageDomain,
        ...[appInfo.stageDomainAlias].filter((domain: string) => domain !== appInfo.stageDomain && domain),
      ]
    : [
        appInfo.devDomain,
        ...[appInfo.devDomainAlias].filter((domain: string) => domain !== appInfo.devDomain && !!domain),
      ];

const keyPath = path.resolve(`./var/greenlock.d/live/${altnames[0]}/privkey.pem`);
const certPath = path.resolve(`./var/greenlock.d/live/${altnames[0]}/cert.pem`);
const bundlePath = path.resolve(`./var/greenlock.d/live/${altnames[0]}/bundle.pem`);
const chainPath = path.resolve(`./var/greenlock.d/live/${altnames[0]}/chain.pem`);
const fullchainPath = path.resolve(`./var/greenlock.d/live/${altnames[0]}/fullchain.pem`);

const newKeyPath = path.resolve(appInfo.sslKey);
const newCertPath = path.resolve(appInfo.sslCert);
const newBundlePath = path.resolve(appInfo.sslCa);
const newChainPath = path.resolve(appInfo.sslChain);
const newFullchainPath = path.resolve(appInfo.sslFullchain);

const checkCertificatesInterval = (): void => {
  let intervalCount = 0;
  _checkCertificatesInterval = setInterval(() => {
    if (
      fs.existsSync(keyPath) &&
      fs.existsSync(certPath) &&
      fs.existsSync(bundlePath) &&
      fs.existsSync(chainPath) &&
      fs.existsSync(fullchainPath)
    ) {
      if (intervalCount > 19) {
        console.error('certificate files (all or some) appear to be missing');
        process.exit(1);
      }
      intervalCount++;

      fs.copyFileSync(keyPath, newKeyPath);
      fs.copyFileSync(certPath, newCertPath);
      fs.copyFileSync(bundlePath, newBundlePath);
      fs.copyFileSync(chainPath, newChainPath);
      fs.copyFileSync(fullchainPath, newFullchainPath);

      console.info('greenlock ok. all done');
      _checkCertificatesInterval && clearInterval(_checkCertificatesInterval);
      process.exit(0);
    }
  }, 1000);
};

const main = async (): Promise<void> => {
  // clean and backup ../packages/sotaoi-omni/certs/*.pem
  // const sslDirectory = path.resolve(process.env.SSL_DIRECTORY || '../packages/sotaoi-omni/certs');
  // const sslBackupDirectory = path.resolve(process.env.SSL_DIRECTORY || '../packages/sotaoi-omni/certs', 'backup');
  const sslDirectory = path.resolve('../packages/sotaoi-omni/certs');
  const sslBackupDirectory = path.resolve('../packages/sotaoi-omni/certs', 'backup');
  !fs.existsSync(path.resolve(sslBackupDirectory)) && fs.mkdirSync(path.resolve(sslBackupDirectory));
  fs.existsSync(path.resolve(sslDirectory, 'bundle.pem')) &&
    fs.renameSync(path.resolve(sslDirectory, 'bundle.pem'), path.resolve(sslBackupDirectory, 'bundle.pem'));
  fs.existsSync(path.resolve(sslDirectory, 'cert.pem')) &&
    fs.renameSync(path.resolve(sslDirectory, 'cert.pem'), path.resolve(sslBackupDirectory, 'cert.pem'));
  fs.existsSync(path.resolve(sslDirectory, 'chain.pem')) &&
    fs.renameSync(path.resolve(sslDirectory, 'chain.pem'), path.resolve(sslBackupDirectory, 'chain.pem'));
  fs.existsSync(path.resolve(sslDirectory, 'fullchain.pem')) &&
    fs.renameSync(path.resolve(sslDirectory, 'fullchain.pem'), path.resolve(sslBackupDirectory, 'fullchain.pem'));
  fs.existsSync(path.resolve(sslDirectory, 'privkey.pem')) &&
    fs.renameSync(path.resolve(sslDirectory, 'privkey.pem'), path.resolve(sslBackupDirectory, 'privkey.pem'));

  // clean ./var/greenlock.d
  fs.rmdirSync(path.resolve('./var/greenlock.d'), { recursive: true });
  fs.mkdirSync(path.resolve('./var/greenlock.d'), { recursive: true });
  fs.writeFileSync(path.resolve('./var/greenlock.d/.gitkeep'), '');

  try {
    const expressrdr = express();
    expressrdr.get('*', (req, res) => {
      if (req.url.substr(0, 12) === '/.well-known') {
        console.info(`running acme verification: ${req.url}`);
        const acme = fs.readdirSync(path.resolve('./var/greenlock.d/accounts'));
        const urlSplit = req.url.substr(1).split('/');
        const credentials = require(path.resolve(
          `./var/greenlock.d/accounts/${acme[0]}/directory/${appInfo.sslMaintainer}.json`,
        ));
        console.info('greenlock credentials:', credentials);
        return res.send(urlSplit[2] + '.' + credentials.publicKeyJwk.kid);
      }
      return res.send('waiting for greenlock...');
    });
    servers.push(expressrdr.listen(80));
    console.info(`[${getTimestamp()}] Proxy server redirecting from port 80`);
  } catch (err) {
    console.error(err);
  }

  const greenlock = Greenlock.create({
    configDir: path.resolve('./var/greenlock.d'),
    packageAgent: _package.name + '/' + _package.version,
    packageRoot: path.resolve('./'),
    maintainerEmail: appInfo.sslMaintainer,
    staging: false,
    notify: (event: any, details: any) => {
      if ('error' === event) {
        // `details` is an error object in this case
        console.error(details);
      }
    },
  });

  greenlock
    .add({
      agreeToTerms: true,
      subscriberEmail: appInfo.sslMaintainer,
      subject: altnames[0],
      altnames,
    })
    .then((fullConfig: any) => {
      console.info('greenlock ok. fetching certificates...');
      checkCertificatesInterval();
    })
    .catch((err: any) => {
      console.error(err && err.stack ? err.stack : err);
      process.exit(1);
    });
};

main();
