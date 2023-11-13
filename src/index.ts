import * as core from '@actions/core';
import * as path from 'path';
import { Env } from './env';
import { getSecretsFromGitHub } from './secrets/github';
import { getSecretsFromInfisical } from './secrets/infisical';

async function main(input: { directory: string; token: string; environment: string }): Promise<void> {
  const { directory, token, environment } = input;
  const env: Env = new Env();
  env.addMany([...(await getSecretsFromGitHub()), ...(await getSecretsFromInfisical(token, environment))]);
  env.save(path.join(process.env['GITHUB_WORKSPACE'] === 'None' ? '.' : process.env['GITHUB_WORKSPACE'] || '.', directory, '.env'));
}

main({
  directory: core.getInput('directory'),
  token: core.getInput('token'),
  environment: core.getInput('environment'),
})
  .then(() => core.info('Successfully created file'))
  .catch((error) => core.setFailed(error.message));
