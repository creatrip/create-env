import InfisicalClient from 'infisical-node';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

interface Input {
  directory: string;
  token: string;
  environment: string;
}

async function main(input: Input): Promise<void> {
  const { directory, token, environment } = input;

  let outFile: string = '';

  const infisicalClient = new InfisicalClient({ token });
  const infisical = await infisicalClient.getAllSecrets({ environment, path: '/', attachToProcessEnv: false, includeImports: true });
  infisical.forEach((secret) => {
    if (secret.secretValue.includes('\n')) outFile += `${secret.secretName}="${secret.secretValue.replace(/\r?\n/g, '\\n')}"\n`;
    else outFile += `${secret.secretName}=${secret.secretValue}\n`;
  });

  for (const key of Object.keys(process.env)) {
    if (!key.startsWith('INPUT_ENVKEY_')) continue;
    const name = key.split('INPUT_ENVKEY_')[1];
    const value = process.env[key] || '';
    if (value === '') throw new Error(`Empty env key found: ${key}`);
    if (value.includes('\n')) outFile += `${name}="${value.replace(/\r?\n/g, '\\n')}"\n`;
    else outFile += `${name}=${value}\n`;
  }

  let filePath = process.env['GITHUB_WORKSPACE'] || '.';
  if (filePath === '' || filePath === 'None') filePath = '.';
  if (directory === '') filePath = path.join(filePath, '.env');
  else if (directory.startsWith('/')) throw new Error('Absolute paths are not allowed. Please use a relative path.');
  else if (directory.startsWith('./')) filePath = path.join(filePath, directory.slice(2), '.env');
  else filePath = path.join(filePath, directory, '.env');

  core.debug(`Creating file: ${filePath}`);

  fs.writeFileSync(filePath, outFile);
}

main({
  directory: core.getInput('directory'),
  token: core.getInput('token'),
  environment: core.getInput('environment'),
})
  .then(() => core.info('Successfully created file'))
  .catch((error) => core.setFailed(error.message));
