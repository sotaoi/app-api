#!/bin/env node

import { main } from '@app/api/main';
import { rollback } from '@sotaoi/api/db';
import { logger } from '@sotaoi/api/logger';

const run = async (): Promise<void> => {
  try {
    await main(true);

    const rollbacks = (await rollback())[1];
    !rollbacks.length && (rollbacks[0] = 'No rollbacks');

    logger().info(`\n\nRollback complete:\n${rollbacks.join('\n')}\n`);
    process.exit(0);
  } catch (err) {
    logger().estack(err);
    process.exit(1);
  }
};

run();
