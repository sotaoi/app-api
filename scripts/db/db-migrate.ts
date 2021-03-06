#!/bin/env node

import { main } from '@app/api/main';
import { migrate } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';
import { cpanelMigrate } from '@sotaoi/api/db/cpanel-tables';
import { getAppInfo } from '@sotaoi/omni/get-app-info';

const run = async (): Promise<void> => {
  try {
    await main(true);
    logger().info(`Running app migrations...\n`);

    const migrations = (await migrate())[1];
    !migrations.length && (migrations[0] = 'No new migrations');
    logger().info(`\n\nMigrate command complete:\n${migrations.join('\n')}\n`);

    logger().info(`Running control panel migrations...\n`);
    await cpanelMigrate(getAppInfo().isMasterBundle === 'yes');

    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

run();
