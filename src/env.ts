import * as fs from 'fs';

export class Env {
  private readonly data: Map<string, string> = new Map();

  add(key: string, value: string): void {
    this.data.set(key, value);
  }

  addMany(secrets: { key: string; value: string }[]): void {
    secrets.forEach((secret) => this.add(secret.key, secret.value));
  }

  toString(): string {
    return (
      Array.from(this.data.entries())
        .map(([key, value]) => {
          if (value.includes('\n')) return `${key}="${value.replace(/\r?\n/g, '\\n')}"`;
          return `${key}=${value}`;
        })
        .join('\n') + '\n'
    );
  }

  save(filePath: string): void {
    fs.writeFileSync(filePath, this.toString());
  }
}
