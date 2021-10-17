import fs from 'fs';
import path from 'path';
import { Helper } from '@sotaoi/omni/helper';
import { execSync } from 'child_process';

const buildAapiRoutine = async (deploy: boolean) => {
  if (typeof deploy !== 'boolean') {
    throw new Error('Bad deployment flag');
  }

  //

  fs.rmdirSync(path.resolve('./deployment'), { recursive: true });
  fs.rmdirSync(path.resolve('./tmp.deployment'), { recursive: true });
  fs.mkdirSync(path.resolve('./deployment'));
  fs.writeFileSync(path.resolve('./deployment/.gitkeep'), '');

  const packageJson = JSON.parse(fs.readFileSync(path.resolve('./package.json')).toString());

  deploy && fs.mkdirSync(path.resolve('./tmp.deployment'));
  deploy &&
    execSync(`git clone git@github.com:sotaoi/app-api . && git checkout -b ${packageJson.version}`, {
      cwd: path.resolve('./tmp.deployment'),
      stdio: 'inherit',
    });

  Helper.copyRecursiveSync(fs, path, path.resolve('./'), path.resolve('./deployment'), [
    path.resolve('.git'),
    path.resolve('./deployment'),
    path.resolve('./certs'),
    path.resolve('./node_modules'),
    path.resolve('./tmp.deployment'),
  ]);

  delete packageJson.devDependencies;
  fs.writeFileSync(path.resolve('./deployment/package.json'), JSON.stringify(packageJson, null, 2));

  execSync('npx tsc', { cwd: path.resolve('./deployment'), stdio: 'inherit' });
  fs.unlinkSync(path.resolve('./deployment/tsconfig.json'));
  execSync('npm run bootstrap:prod', { cwd: path.resolve('./deployment'), stdio: 'inherit' });

  Helper.iterateRecursiveSync(
    fs,
    path,
    path.resolve('./deployment'),
    (item) => {
      if (fs.lstatSync(item).isDirectory()) {
        return;
      }
      item = path.resolve(item);
      if (item.substr(-3) === '.ts' && item.substr(-5) !== '.d.ts') {
        const filename = item.substr(0, item.length - 3);
        fs.existsSync(`${filename}.ts`) &&
          fs.lstatSync(`${filename}.ts`).isFile() &&
          fs.existsSync(`${filename}.js`) &&
          fs.lstatSync(`${filename}.js`).isFile() &&
          fs.existsSync(`${filename}.d.ts`) &&
          fs.lstatSync(`${filename}.d.ts`).isFile() &&
          fs.unlinkSync(item);
      }
      item.substr(-4) === '.tsx' && fs.unlinkSync(item);
    },
    [path.resolve('./deployment/node_modules')],
  );

  deploy && fs.renameSync(path.resolve('./tmp.deployment/.git'), path.resolve('./deployment/.git'));
  deploy && fs.rmdirSync(path.resolve('./tmp.deployment'), { recursive: true });
  deploy &&
    execSync(
      `git add --all && git commit -m "release ${packageJson.version}" && git push -f -u origin ${packageJson.version}`,
      {
        cwd: path.resolve('./deployment'),
        stdio: 'inherit',
      },
    );
  deploy && fs.rmdirSync(path.resolve('./deployment/.git'), { recursive: true });

  fs.copyFileSync(path.resolve('../app-omni/env.json'), path.resolve('./deployment/node_modules/@app/omni/env.json'));
  Helper.copyRecursiveSync(
    fs,
    path,
    path.resolve('../app-omni/certs'),
    path.resolve('./deployment/node_modules/@app/omni/certs'),
  );

  //
};

export { buildAapiRoutine };
