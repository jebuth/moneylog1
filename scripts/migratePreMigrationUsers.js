/**
 * One-time migration script: backfill categoryId on pre-migration log categories and transactions.
 *
 * Setup (run once):
 *   npm install firebase-admin
 *
 * Download a service account key from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 * Save it as:
 *   scripts/serviceAccountKey.json   (already in .gitignore)
 *
 * Usage:
 *   # Migrate specific users
 *   node scripts/migratePreMigrationUsers.js Ry0ZBqPJFjRGUmYjkV5Z2G1604w1 anotherUserId
 *
 *   # Migrate ALL users (use with caution)
 *   node scripts/migratePreMigrationUsers.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

// Must match AuthContext.jsx APP_CATEGORIES (used as fallback if appCategories collection is missing meta)
const APP_CATEGORY_META = {
  'Entertainment':  { icon: 'game-controller-outline', color: '#6BCB77' },
  'Gifts':          { icon: 'gift-outline',            color: '#FF6BD6' },
  'Groceries':      { icon: 'cart-outline',            color: '#4D96FF' },
  'Health/Medical': { icon: 'medkit-outline',          color: '#4ECDC4' },
  'Home':           { icon: 'home-outline',            color: '#45B7D1' },
  'Personal':       { icon: 'person-outline',          color: '#A78BFA' },
  'Pets':           { icon: 'paw-outline',             color: '#FFA07A' },
  'Restaurants':    { icon: 'restaurant-outline',      color: '#FF6B6B' },
  'Transportation': { icon: 'car-outline',             color: '#96CEB4' },
  'Utilities':      { icon: 'flash-outline',           color: '#FFD93D' },
};

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return value;
}

async function buildAppCategoryMap() {
  const snap = await db.collection('appCategories').get();
  const nameToId = {};
  const nameToMeta = {};
  snap.forEach(doc => {
    const d = doc.data();
    nameToId[d.name] = doc.id;
    nameToMeta[d.name] = { icon: d.icon, color: d.color };
  });
  if (snap.empty) throw new Error('appCategories collection is empty — cannot map names to IDs.');
  console.log(`Loaded ${snap.size} app categories from Firestore.`);
  return { nameToId, nameToMeta };
}

async function migrateUser(userId, appNameToId, appNameToMeta) {
  console.log(`\n--- User: ${userId} ---`);

  // Fetch user's custom (non-app) categories
  const userCatsSnap = await db.collection('users').doc(userId).collection('categories').get();
  const userNameToId = {};
  const userNameToMeta = {};
  userCatsSnap.forEach(doc => {
    const d = doc.data();
    if (!d.isDeleted) {
      userNameToId[d.name] = doc.id;
      userNameToMeta[d.name] = { icon: d.icon, color: d.color };
    }
  });

  // App categories take priority over user categories with the same name
  const nameToId   = { ...userNameToId,   ...appNameToId   };
  const nameToMeta = { ...userNameToMeta, ...appNameToMeta };

  // Fetch all logs for this user
  const logsSnap = await db.collection('logs').where('userId', '==', userId).get();
  if (logsSnap.empty) {
    console.log('  No logs found — skipping.');
    return;
  }

  let logsUpdated = 0;
  let catsFixed   = 0;
  let txFixed     = 0;

  for (const logDoc of logsSnap.docs) {
    const log  = logDoc.data();
    let dirty  = false;

    // Fix log-level categories
    const updatedCategories = (log.categories || []).map(cat => {
      if (cat.categoryId) return cat; // already has an ID
      const id   = nameToId[cat.name];
      const meta = nameToMeta[cat.name] || APP_CATEGORY_META[cat.name] || {};
      if (!id) {
        console.warn(`  [log ${logDoc.id}] Unknown category name "${cat.name}" — left as-is.`);
        return cat;
      }
      dirty = true;
      catsFixed++;
      return {
        ...cat,
        categoryId: id,
        icon:  cat.icon  || meta.icon  || 'grid-outline',
        color: cat.color || meta.color || '#888888',
      };
    });

    // Fix transactions
    const updatedTransactions = (log.transactions || []).map(tx => {
      if (tx.categoryId) return tx; // already has an ID
      const id = nameToId[tx.category];
      if (!id) {
        console.warn(`  [log ${logDoc.id}] Unknown tx category "${tx.category}" — left as-is.`);
        return tx;
      }
      dirty = true;
      txFixed++;
      return { ...tx, categoryId: id };
    });

    if (dirty) {
      const payload = stripUndefined({ categories: updatedCategories, transactions: updatedTransactions });
      await db.collection('logs').doc(logDoc.id).update(payload);
      logsUpdated++;
      console.log(`  Updated log "${log.logTitle}" (${logDoc.id})`);
    }
  }

  console.log(`  Result: ${logsUpdated} log(s) updated, ${catsFixed} category ref(s) fixed, ${txFixed} transaction(s) fixed.`);
}

async function main() {
  const targetUserIds = process.argv.slice(2);

  const { nameToId, nameToMeta } = await buildAppCategoryMap();

  let userIds = targetUserIds;
  if (userIds.length === 0) {
    console.log('No user IDs provided — migrating ALL users.');
    const usersSnap = await db.collection('users').get();
    userIds = usersSnap.docs.map(d => d.id);
  }

  console.log(`\nMigrating ${userIds.length} user(s)...`);
  for (const uid of userIds) {
    await migrateUser(uid, nameToId, nameToMeta);
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
