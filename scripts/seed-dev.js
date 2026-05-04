#!/usr/bin/env node
/**
 * DEV-ONLY: Firestore seed script for local development.
 *
 * Seeds fake users, reading activities, and follow relationships so the
 * Timeline and Feed UIs can be verified visually without real user data.
 *
 * All seeded document IDs are prefixed with "dev_" and are easily removed.
 *
 * ─── Setup (one-time) ───────────────────────────────────────────────────────
 *
 *  1. Install the admin SDK (dev only):
 *       pnpm add -D firebase-admin
 *
 *  2. Supply credentials — one of two ways:
 *
 *     Option A — Service account key file (recommended for local use):
 *       • Firebase Console > Project Settings > Service accounts
 *       • "Generate new private key"  →  save as  scripts/service-account.json
 *         (already gitignored — never commit this file)
 *
 *     Option B — Application Default Credentials:
 *       • firebase login  (Firebase CLI)
 *       • No file needed; the script falls back to ADC automatically.
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *
 *   Seed:   node scripts/seed-dev.js
 *   Clean:  node scripts/seed-dev.js --clean
 *
 *   npm shortcuts (after adding to package.json scripts):
 *     pnpm seed:dev
 *     pnpm seed:dev:clean
 *
 * ─── Notes ──────────────────────────────────────────────────────────────────
 *
 *   • Safe to rerun — documents are overwritten by deterministic ID, no duplicates.
 *   • Does not touch any document whose ID does not start with "dev_".
 *   • Seeded data is clearly labelled in displayLabel (e.g. "Quiet Fox [dev]").
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ─── Firebase Admin init ────────────────────────────────────────────────────

let admin;
try {
  admin = require('firebase-admin');
} catch {
  console.error('\n  ERROR: firebase-admin is not installed.');
  console.error('  Run:  pnpm add -D firebase-admin\n');
  process.exit(1);
}

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, 'service-account.json');

if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  // Fall back to Application Default Credentials (firebase login / gcloud auth)
  admin.initializeApp();
}

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

// ─── Seed data definitions ──────────────────────────────────────────────────

const USERS = [
  { id: 'dev_u1', displayLabel: 'Quiet Fox [dev]',   adjective: 'Quiet',  animalKey: 'fox'  },
  { id: 'dev_u2', displayLabel: 'Bold Bear [dev]',    adjective: 'Bold',   animalKey: 'bear' },
  { id: 'dev_u3', displayLabel: 'Gentle Fox [dev]',   adjective: 'Gentle', animalKey: 'fox'  },
  { id: 'dev_u4', displayLabel: 'Wise Bear [dev]',    adjective: 'Wise',   animalKey: 'bear' },
  { id: 'dev_u5', displayLabel: 'Swift Fox [dev]',    adjective: 'Swift',  animalKey: 'fox'  },
  { id: 'dev_u6', displayLabel: 'Calm Bear [dev]',    adjective: 'Calm',   animalKey: 'bear' },
  { id: 'dev_u7', displayLabel: 'Bright Fox [dev]',   adjective: 'Bright', animalKey: 'fox'  },
  { id: 'dev_u8', displayLabel: 'Sleepy Bear [dev]',  adjective: 'Sleepy', animalKey: 'bear' },
];

const BOOKS = [
  { id: 'dev_b01', title: 'The Midnight Library',                    authors: ['Matt Haig'] },
  { id: 'dev_b02', title: 'Project Hail Mary',                       authors: ['Andy Weir'] },
  { id: 'dev_b03', title: 'Klara and the Sun',                       authors: ['Kazuo Ishiguro'] },
  { id: 'dev_b04', title: 'The Overstory',                           authors: ['Richard Powers'] },
  { id: 'dev_b05', title: 'Piranesi',                                authors: ['Susanna Clarke'] },
  { id: 'dev_b06', title: 'A Gentleman in Moscow',                   authors: ['Amor Towles'] },
  { id: 'dev_b07', title: 'Tomorrow, and Tomorrow, and Tomorrow',    authors: ['Gabrielle Zevin'] },
  { id: 'dev_b08', title: 'The House in the Cerulean Sea',           authors: ['TJ Klune'] },
  { id: 'dev_b09', title: 'Normal People',                           authors: ['Sally Rooney'] },
  { id: 'dev_b10', title: 'All the Light We Cannot See',             authors: ['Anthony Doerr'] },
  { id: 'dev_b11', title: 'Recursion',                               authors: ['Blake Crouch'] },
  { id: 'dev_b12', title: 'The Song of Achilles',                    authors: ['Madeline Miller'] },
  { id: 'dev_b13', title: 'Mexican Gothic',                          authors: ['Silvia Moreno-Garcia'] },
  { id: 'dev_b14', title: 'The Night Circus',                        authors: ['Erin Morgenstern'] },
  { id: 'dev_b15', title: 'Exhalation',                              authors: ['Ted Chiang'] },
];

// [userId, bookId, finishedDaysAgo]  — 25 entries, ordered newest-first for readability
const ACTIVITY_SPECS = [
  ['dev_u1', 'dev_b01',  2],
  ['dev_u2', 'dev_b02',  3],
  ['dev_u3', 'dev_b03',  5],
  ['dev_u4', 'dev_b04',  7],
  ['dev_u1', 'dev_b05',  9],
  ['dev_u5', 'dev_b06', 11],
  ['dev_u6', 'dev_b07', 13],
  ['dev_u2', 'dev_b08', 15],
  ['dev_u7', 'dev_b09', 17],
  ['dev_u3', 'dev_b10', 19],
  ['dev_u8', 'dev_b11', 21],
  ['dev_u4', 'dev_b12', 24],
  ['dev_u5', 'dev_b13', 27],
  ['dev_u1', 'dev_b14', 30],
  ['dev_u6', 'dev_b02', 33],
  ['dev_u7', 'dev_b01', 37],
  ['dev_u8', 'dev_b03', 41],
  ['dev_u2', 'dev_b15', 45],
  ['dev_u3', 'dev_b05', 49],
  ['dev_u4', 'dev_b07', 54],
  ['dev_u5', 'dev_b09', 59],
  ['dev_u6', 'dev_b11', 64],
  ['dev_u7', 'dev_b13', 70],
  ['dev_u8', 'dev_b14', 77],
  ['dev_u1', 'dev_b15', 85],
];

// [followerId, followedUid]
const FOLLOW_SPECS = [
  ['dev_u1', 'dev_u2'],
  ['dev_u1', 'dev_u3'],
  ['dev_u2', 'dev_u4'],
  ['dev_u3', 'dev_u5'],
  ['dev_u5', 'dev_u1'],
];

// ─── Seed ───────────────────────────────────────────────────────────────────

async function seed() {
  const userMap  = Object.fromEntries(USERS.map(u => [u.id, u]));
  const bookMap  = Object.fromEntries(BOOKS.map(b => [b.id, b]));
  const batch    = db.batch();

  for (const u of USERS) {
    batch.set(db.collection('users').doc(u.id), {
      displayLabel: u.displayLabel,
      adjective:    u.adjective,
      animalKey:    u.animalKey,
      finalizedAt:  daysAgo(90),
    });
  }

  for (const [userId, bookId, days] of ACTIVITY_SPECS) {
    const user = userMap[userId];
    const book = bookMap[bookId];
    batch.set(db.collection('readingActivities').doc(`${userId}_${bookId}`), {
      userId,
      bookId,
      title:        book.title,
      authors:      book.authors,
      thumbnail:    null,
      status:       'finished',
      finishedAt:   daysAgo(days),
      displayLabel: user.displayLabel,
      displayAvatar: user.animalKey,
    });
  }

  for (const [followerId, followedUid] of FOLLOW_SPECS) {
    batch.set(db.collection('follows').doc(`${followerId}_${followedUid}`), {
      followerId,
      followedUid,
      createdAt: daysAgo(30),
    });
  }

  await batch.commit();

  console.log(`  ✓ ${USERS.length} users`);
  console.log(`  ✓ ${ACTIVITY_SPECS.length} reading activities`);
  console.log(`  ✓ ${FOLLOW_SPECS.length} follow relationships`);
  console.log('\n  Reload the app to see the Timeline populated.\n');
}

// ─── Clean ──────────────────────────────────────────────────────────────────

async function clean() {
  const batch = db.batch();

  for (const u of USERS) {
    batch.delete(db.collection('users').doc(u.id));
  }
  for (const [userId, bookId] of ACTIVITY_SPECS) {
    batch.delete(db.collection('readingActivities').doc(`${userId}_${bookId}`));
  }
  for (const [followerId, followedUid] of FOLLOW_SPECS) {
    batch.delete(db.collection('follows').doc(`${followerId}_${followedUid}`));
  }

  await batch.commit();

  console.log(`  ✓ removed ${USERS.length} users`);
  console.log(`  ✓ removed ${ACTIVITY_SPECS.length} reading activities`);
  console.log(`  ✓ removed ${FOLLOW_SPECS.length} follow relationships`);
  console.log('\n  All dev seed data has been removed.\n');
}

// ─── Entry point ────────────────────────────────────────────────────────────

const isClean = process.argv.includes('--clean');
console.log(`\n[seed-dev] ${isClean ? 'Cleaning' : 'Seeding'} Firestore...\n`);

(isClean ? clean() : seed()).catch(err => {
  console.error('\n  ERROR:', err.message, '\n');
  process.exit(1);
});
