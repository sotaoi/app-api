import fs from 'fs';
import path from 'path';
import { Helper } from '@sotaoi/omni/helper';
import { execSync } from 'child_process';

const main = async () => {
  fs.rmdirSync(path.resolve('./build'), { recursive: true });
  fs.mkdirSync(path.resolve('./build'));
  fs.writeFileSync(path.resolve('./build/.gitkeep'), '');

  Helper.copyRecursiveSync(fs, path, path.resolve('./'), path.resolve('./build'), [
    path.resolve('.git'),
    path.resolve('./build'),
    path.resolve('./node_modules'),
  ]);

  const packageJson = JSON.parse(fs.readFileSync(path.resolve('./package.json')).toString());
  for (const [key, value] of Object.entries(packageJson.devDependencies)) {
    typeof value === 'string' &&
      value.substr(0, 8) === 'file:../' &&
      (packageJson.devDependencies[key] = value.replace('file:../', 'file:../../'));
  }
  for (const [key, value] of Object.entries(packageJson.dependencies)) {
    typeof value === 'string' &&
      value.substr(0, 8) === 'file:../' &&
      (packageJson.dependencies[key] = value.replace('file:../', 'file:../../'));
  }
  fs.writeFileSync(path.resolve('build', './package.json'), JSON.stringify(packageJson, null, 2));

  execSync('npx tsc', { cwd: path.resolve('./build') });
  fs.unlinkSync(path.resolve('./build/tsconfig.json'));
  execSync('npm run bootstrap', { cwd: path.resolve('./build') });
  fs.unlinkSync(path.resolve('./build/.gitignore'));
  fs.unlinkSync(path.resolve('./build/.ignore'));

  Helper.iterateRecursiveSync(
    fs,
    path,
    path.resolve('./build'),
    (item) => {
      if (fs.lstatSync(item).isDirectory()) {
        return;
      }
      item = path.resolve(item);
      if (item.length > 3 && item.substr(-3) === '.ts' && item.substr(-5) !== '.d.ts') {
        const filename = item.substr(0, item.length - 3);
        fs.existsSync(`${filename}.ts`) &&
          fs.lstatSync(`${filename}.ts`).isFile() &&
          fs.existsSync(`${filename}.js`) &&
          fs.lstatSync(`${filename}.js`).isFile() &&
          fs.existsSync(`${filename}.d.ts`) &&
          fs.lstatSync(`${filename}.d.ts`).isFile() &&
          fs.unlinkSync(item);
      }
    },
    [path.resolve('./build/node_modules'), path.resolve('./build/storage')],
  );
};

main();
