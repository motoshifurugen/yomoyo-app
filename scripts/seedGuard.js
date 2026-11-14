'use strict';

/**
 * Decides whether seed-dev.js may write to the resolved Firebase project.
 *
 * - The production project is always refused, even with --force.
 * - An unknown project is always refused: it might be production.
 * - The dev project is allowed.
 * - Any other known project needs --force.
 */

const DEV_PROJECT_ID = 'yomoyo-d9c4a';
const PROD_PROJECT_ID = 'yomoyo-prod';

function resolveSeedProjectId({ serviceAccount, env, appProjectId }) {
  return (
    (serviceAccount && serviceAccount.project_id) ||
    env.GOOGLE_CLOUD_PROJECT ||
    env.GCLOUD_PROJECT ||
    env.FIREBASE_PROJECT ||
    appProjectId ||
    null
  );
}

function checkSeedTarget({ projectId, force }) {
  if (projectId === PROD_PROJECT_ID) {
    return { ok: false, reason: 'production project is never seeded (--force does not apply)' };
  }
  if (!projectId) {
    return { ok: false, reason: 'project could not be resolved' };
  }
  if (projectId === DEV_PROJECT_ID) {
    return { ok: true, reason: 'dev project' };
  }
  if (force) {
    return { ok: true, reason: 'non-dev project allowed by --force' };
  }
  return { ok: false, reason: 'not the dev project (pass --force to override)' };
}

module.exports = { DEV_PROJECT_ID, PROD_PROJECT_ID, resolveSeedProjectId, checkSeedTarget };
