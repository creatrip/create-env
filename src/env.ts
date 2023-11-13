import * as fs from 'fs';

export class Env {
  private readonly data: { key: string; value: string }[] = [];

  add(key: string, value: string): void {
    this.data.push({ key, value });
  }

  addMany(secrets: { key: string; value: string }[]): void {
    this.data.push(...secrets);
  }

  toString(): string {
    return (
      this.data
        .map((item) => {
          if (item.value.includes('\n')) return `${item.key}="${item.value.replace(/\r?\n/g, '\\n')}"`;
          return `${item.key}=${item.value}`;
        })
        .join('\n') + '\n'
    );
  }

  save(filePath: string): void {
    fs.writeFileSync(filePath, this.toString());
  }
}
