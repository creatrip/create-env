import InfisicalClient from 'infisical-node';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

interface Input {
  fileName: string;
  directory: string;
  infisicalToken: string;
  infisicalEnv: string;
}

async function main(input: Input): Promise<void> {
  const { fileName, directory, infisicalToken, infisicalEnv } = input;

  let outFile: string = '';

  const infisicalClient = new InfisicalClient({ token: infisicalToken });
  const infisical = await infisicalClient.getAllSecrets({ environment: infisicalEnv, path: '/', attachToProcessEnv: false, includeImports: true });
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
  if (directory === '') filePath = path.join(filePath, fileName);
  else if (directory.startsWith('/')) throw new Error('Absolute paths are not allowed. Please use a relative path.');
  else if (directory.startsWith('./')) filePath = path.join(filePath, directory.slice(2), fileName);
  else filePath = path.join(filePath, directory, fileName);

  core.debug(`Creating file: ${filePath}`);

  fs.writeFileSync(filePath, outFile);
}

main({
  fileName: core.getInput('file_name'),
  directory: core.getInput('directory'),
  infisicalToken: core.getInput('infisical_token'),
  infisicalEnv: core.getInput('infisical_env'),
})
  .then(() => core.info('Successfully created file'))
  .catch((error) => core.setFailed(error.message));
