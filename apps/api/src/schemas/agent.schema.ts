import { z } from 'zod';
import { AgentKind } from '@whistle/types';

export const agentKindParam = z
  .string()
  .transform((value) => value.toUpperCase())
  .pipe(z.nativeEnum(AgentKind));
