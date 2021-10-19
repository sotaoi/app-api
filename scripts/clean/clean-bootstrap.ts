#!/bin/env/node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const main = async () => {
  fs.existsSync(path.resolve('./package-lock.json')) && fs.unlinkSync(path.resolve('./package-lock.json'));
  fs.rmdirSync(path.resolve('./node_modules'), { recursive: true });
  execSync('npm run bootstrap', { stdio: 'inherit' });
};

main();
