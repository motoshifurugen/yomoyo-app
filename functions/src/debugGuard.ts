// Decides whether the debug callables (sendTestPush / dryRunResolveRecipients)
// may exist in the current environment.
//
// The Firebase CLI loads this codebase with GCLOUD_PROJECT set to the deploy
// target before deciding what to deploy, so the same check keeps the debug
// callables out of a production deploy and refuses them at runtime.
//
// The check fails closed: an unknown project counts as "not allowed".

export const DEV_PROJECT_ID = 'yomoyo-d9c4a';
export const PROD_PROJECT_ID = 'yomoyo-prod';

type Env = Record<string, string | undefined>;

export function resolveProjectId(env: Env): string | undefined {
  const fromEnv = env.GCLOUD_PROJECT ?? env.GOOGLE_CLOUD_PROJECT;
  if (fromEnv) return fromEnv;
  if (!env.FIREBASE_CONFIG) return undefined;
  try {
    const parsed = JSON.parse(env.FIREBASE_CONFIG) as { projectId?: unknown };
    return typeof parsed.projectId === 'string' ? parsed.projectId : undefined;
  } catch {
    return undefined;
  }
}

export function debugCallablesAllowed(env: Env): boolean {
  const projectId = resolveProjectId(env);
  if (projectId === PROD_PROJECT_ID) return false;
  if (projectId === DEV_PROJECT_ID) return true;
  if (env.FUNCTIONS_EMULATOR === 'true') return true;
  return env.ENABLE_DEBUG_FUNCTIONS === 'true';
}
