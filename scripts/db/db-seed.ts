#!/bin/env node

import { main } from '@app/api/main';
import { seed } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';
import { getAppInfo } from '@sotaoi/omni/get-app-info';
import { cpanelSeed } from '@sotaoi/api/db/cpanel-tables';

const run = async (): Promise<void> => {
  try {
    await main(true);
    logger().info(`Running app seeds...\n`);

    const seeds = (await seed())[0];
    !seeds.length && (seeds[0] = 'No seed files');
    logger().info(`\n\nSeeding complete:\n${seeds.join('\n')}\n`);

    logger().info(`Running control panel seeds...\n`);
    await cpanelSeed(getAppInfo().isMasterBundle === 'yes');

    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

run();
