export async function getSecretsFromGitHub(): Promise<{ key: string; value: string }[]> {
  return Object.keys(process.env)
    .map((key) => {
      if (!key.startsWith('INPUT_ENVKEY_')) return;
      return { key: key.split('INPUT_ENVKEY_')[1], value: process.env[key] };
    })
    .filter((secret) => !!secret);
}
