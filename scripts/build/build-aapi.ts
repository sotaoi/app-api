#!/bin/env node

import { buildAapiRoutine } from '@app/api/scripts/routines/build-aapi-routine';

const main = async () => {
  //

  await buildAapiRoutine(false);

  //
};

main();
