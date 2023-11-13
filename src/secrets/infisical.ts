import InfisicalClient from 'infisical-node';

export async function getSecretsFromInfisical(token: string, environment: string): Promise<{ key: string; value: string }[]> {
  const client = new InfisicalClient({ token });
  const secrets = await client.getAllSecrets({ environment, path: '/', attachToProcessEnv: false, includeImports: true });
  return secrets.map((secret) => ({ key: secret.secretName, value: secret.secretValue }));
}
