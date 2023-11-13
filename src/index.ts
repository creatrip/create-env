import InfisicalClient from 'infisical-node';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

main({
  directory: core.getInput('directory'),
  token: core.getInput('token'),
  environment: core.getInput('env'),
})
  .then(() => core.info('Successfully created file'))
  .catch((error) => core.setFailed(error.message));

async function main(input: { directory: string; token: string; environment: string }): Promise<void> {
  const { directory, token, environment } = input;
  const env = new Env();
  const infisical = new InfisicalClient({ token });
  const secrets = await infisical.getAllSecrets({ environment, path: '/', attachToProcessEnv: false, includeImports: true });
  secrets.map((secret) => env.add(secret.secretName, secret.secretValue));
  Object.keys(process.env).map((key) => {
    if (!key.startsWith('INPUT_ENVKEY_')) return;
    env.add(key.split('INPUT_ENVKEY_')[1], process.env[key]);
  });
  env.save(path.join(process.env['GITHUB_WORKSPACE'] || '.', directory, '.env'));
}

class Env {
  private data: { name: string; value: string }[] = [];

  add(name: string, value: string): void {
    this.data.push({ name, value });
  }

  save(path: string): void {
    fs.writeFileSync(
      path,
      this.data
        .map((secret) => {
          if (secret.value.includes('\n')) return `${secret.name}="${secret.value.replace(/\r?\n/g, '\\n')}"`;
          return `${secret.name}=${secret.value}`;
        })
        .join('\n'),
    );
  }
}
