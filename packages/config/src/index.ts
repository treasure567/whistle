import { config as loadDotenv } from 'dotenv';
import type { ZodType } from 'zod';

let dotenvLoaded = false;

function ensureDotenv(): void {
  if (dotenvLoaded) return;
  loadDotenv();
  dotenvLoaded = true;
}

const envSource = (): NodeJS.ProcessEnv => process.env;

export function defineEnv<TSchema extends ZodType>(schema: TSchema): ReturnType<TSchema['parse']> {
  ensureDotenv();
  const result = schema.safeParse(envSource());
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('\n');
    process.stderr.write(`config validation failed:\n${issues}\n`);
    process.exit(78);
  }
  return result.data as ReturnType<TSchema['parse']>;
}
