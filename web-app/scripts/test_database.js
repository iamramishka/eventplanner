#!/usr/bin/env node
/**
 * Database integration tests — verifies Prisma + SQLite data integrity
 * Tests: schema, CRUD, constraints, relationships, cascades
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

let passed = 0, failed = 0;
const TEST_PREFIX = `dbtest_${Date.now()}`;

function ok(label, cond, detail = '') {
  if (cond) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}${detail ? ' — ' + detail : ''}`); failed++; }
}

async function cleanup() {
  // Remove test data created during this run
  await p.tableAssignment.deleteMany({ where: { guest: { name: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.guestRsvp.deleteMany({ where: { guest: { name: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.guest.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } }).catch(() => {});
  await p.checklistItem.deleteMany({ where: { wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.checklistGroup.deleteMany({ where: { wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.budgetItem.deleteMany({ where: { wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.budgetCategory.deleteMany({ where: { weddingId: { not: null }, wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.agendaItem.deleteMany({ where: { wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.galleryImage.deleteMany({ where: { wedding: { slug: { startsWith: TEST_PREFIX } } } }).catch(() => {});
  await p.wedding.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } }).catch(() => {});
  await p.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } }).catch(() => {});
}

async function run() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     WedPlan — Database Integration Tests     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await cleanup(); // clean any leftovers from a previous aborted run

  // ── 1. Schema / table existence ─────────────────────────────────────────────
  console.log('1. Schema — all tables reachable');
  const models = ['user','wedding','guest','guestRsvp','galleryImage','agendaItem',
                  'table','tableAssignment','budgetCategory','budgetItem',
                  'checklistGroup','checklistItem','weddingVendor'];
  for (const m of models) {
    try {
      await p[m].count();
      ok(`Table "${m}" exists and is queryable`, true);
    } catch (e) {
      ok(`Table "${m}" exists and is queryable`, false, e.message);
    }
  }

  // ── 2. User CRUD ─────────────────────────────────────────────────────────────
  console.log('\n2. User — create / read / update / delete');
  const hash = await bcrypt.hash('TestPass1!', 10);
  const user = await p.user.create({
    data: { email: `${TEST_PREFIX}@test.lk`, name: 'DB Test User', role: 'COUPLE', password: hash }
  });
  ok('User created', !!user.id);
  ok('Role stored correctly', user.role === 'COUPLE');

  const fetched = await p.user.findUnique({ where: { id: user.id } });
  ok('User readable by id', fetched?.email === `${TEST_PREFIX}@test.lk`);

  const updated = await p.user.update({ where: { id: user.id }, data: { name: 'Updated Name' } });
  ok('User name updated', updated.name === 'Updated Name');

  const byEmail = await p.user.findUnique({ where: { email: `${TEST_PREFIX}@test.lk` } });
  ok('Email unique index works', byEmail?.id === user.id);

  // ── 3. Unique email constraint ────────────────────────────────────────────────
  console.log('\n3. Constraints — unique email');
  let dupError = false;
  try {
    await p.user.create({ data: { email: `${TEST_PREFIX}@test.lk`, name: 'Dup', role: 'COUPLE' } });
  } catch { dupError = true; }
  ok('Duplicate email rejected', dupError);

  // ── 4. Wedding CRUD + FK ──────────────────────────────────────────────────────
  console.log('\n4. Wedding — create / read / nullable fields');
  const wedding = await p.wedding.create({
    data: {
      userId: user.id,
      groomFirstName: 'Groom',
      brideFirstName: 'Bride',
      slug: `${TEST_PREFIX}-slug`,
      setupCompleted: false,
    }
  });
  ok('Wedding created', !!wedding.id);
  ok('eventDate nullable (null stored)', wedding.eventDate === null);
  ok('venueName nullable', wedding.venueName === null);
  ok('estimatedGuests nullable', wedding.estimatedGuests === null);

  const wWithDate = await p.wedding.update({
    where: { id: wedding.id },
    data: { eventDate: new Date('2027-06-01'), venueName: 'Test Venue', estimatedGuests: 100 }
  });
  ok('eventDate updated', wWithDate.eventDate !== null);
  ok('venueName updated', wWithDate.venueName === 'Test Venue');

  const wBySlug = await p.wedding.findUnique({ where: { slug: `${TEST_PREFIX}-slug` } });
  ok('Slug unique index works', wBySlug?.id === wedding.id);

  // ── 5. Guest CRUD + FK ────────────────────────────────────────────────────────
  console.log('\n5. Guest — create / read / relationship');
  const guest = await p.guest.create({
    data: {
      weddingId: wedding.id,
      name: `${TEST_PREFIX} Guest`,
      side: 'BRIDE',
      invitationType: 'INDIVIDUAL',
    }
  });
  ok('Guest created', !!guest.id);
  ok('Guest linked to wedding', guest.weddingId === wedding.id);

  const guestsForWedding = await p.guest.findMany({ where: { weddingId: wedding.id } });
  ok('Guest readable by weddingId', guestsForWedding.length === 1);

  // ── 6. RSVP ──────────────────────────────────────────────────────────────────
  console.log('\n6. GuestRsvp — create / read');
  const rsvp = await p.guestRsvp.create({
    data: { guestId: guest.id, status: 'CONFIRMED', attendingCount: 1, mealPreference: 'VEGETARIAN' }
  });
  ok('RSVP created', !!rsvp.id);
  ok('Status stored', rsvp.status === 'CONFIRMED');
  ok('Meal preference stored', rsvp.mealPreference === 'VEGETARIAN');

  const rsvpFetched = await p.guestRsvp.findUnique({ where: { guestId: guest.id } });
  ok('RSVP readable by guestId', rsvpFetched?.status === 'CONFIRMED');

  // ── 7. Budget ─────────────────────────────────────────────────────────────────
  console.log('\n7. Budget — category + item');
  const cat = await p.budgetCategory.create({
    data: { weddingId: wedding.id, name: 'Venue' }
  });
  ok('Budget category created', !!cat.id);

  const item = await p.budgetItem.create({
    data: { weddingId: wedding.id, categoryId: cat.id, title: 'Deposit', estimatedAmount: 50000, status: 'PLANNED' }
  });
  ok('Budget item created', !!item.id);
  ok('Estimated amount stored', item.estimatedAmount === 50000);

  const items = await p.budgetItem.findMany({ where: { categoryId: cat.id } });
  ok('Budget item readable by categoryId', items.length === 1);

  // ── 8. Checklist ──────────────────────────────────────────────────────────────
  console.log('\n8. Checklist — group + item');
  const group = await p.checklistGroup.create({
    data: { weddingId: wedding.id, title: 'Venue & Catering' }
  });
  ok('Checklist group created', !!group.id);

  const task = await p.checklistItem.create({
    data: { weddingId: wedding.id, groupId: group.id, title: 'Book venue', isCompleted: false }
  });
  ok('Checklist item created', !!task.id);

  const completedTask = await p.checklistItem.update({
    where: { id: task.id }, data: { isCompleted: true }
  });
  ok('Checklist item marked complete', completedTask.isCompleted === true);

  // ── 9. Gallery ────────────────────────────────────────────────────────────────
  console.log('\n9. Gallery image');
  const img = await p.galleryImage.create({
    data: { weddingId: wedding.id, imageUrl: '/uploads/test.jpg', imageType: 'PHOTO', sortOrder: 0 }
  });
  ok('Gallery image created', !!img.id);

  const imgs = await p.galleryImage.findMany({ where: { weddingId: wedding.id } });
  ok('Gallery image readable by weddingId', imgs.length === 1);

  // ── 10. Agenda ────────────────────────────────────────────────────────────────
  console.log('\n10. Agenda item');
  const agenda = await p.agendaItem.create({
    data: { weddingId: wedding.id, eventTime: new Date('2027-06-01T16:00:00Z'), title: 'Ceremony', sortOrder: 0 }
  });
  ok('Agenda item created', !!agenda.id);

  // ── 11. Relationship integrity — wedding with user ────────────────────────────
  console.log('\n11. Relationships');
  const weddingWithUser = await p.wedding.findUnique({
    where: { id: wedding.id },
    include: { user: true, guests: true }
  });
  ok('Wedding includes user relation', weddingWithUser?.user?.email === `${TEST_PREFIX}@test.lk`);
  ok('Wedding includes guests relation', Array.isArray(weddingWithUser?.guests));
  ok('Guest count via relation = 1', weddingWithUser?.guests?.length === 1);

  // ── 12. FK enforcement — orphan guest blocked ─────────────────────────────────
  console.log('\n12. Foreign key — orphan insert blocked');
  let fkError = false;
  try {
    await p.guest.create({ data: { weddingId: 'nonexistent_id_xyz', name: 'Orphan', side: 'BRIDE', invitationType: 'INDIVIDUAL' } });
  } catch { fkError = true; }
  ok('Guest with invalid weddingId rejected', fkError);

  // ── 13. Role enum values ──────────────────────────────────────────────────────
  console.log('\n13. Role enum — all three roles writable');
  for (const role of ['COUPLE', 'VENDOR', 'SUPER_ADMIN']) {
    const u = await p.user.create({
      data: { email: `${TEST_PREFIX}_${role.toLowerCase()}@test.lk`, name: role, role }
    });
    ok(`Role ${role} stored`, u.role === role);
    await p.user.delete({ where: { id: u.id } });
  }

  // ── 14. Existing seed data intact ─────────────────────────────────────────────
  console.log('\n14. Seed data integrity');
  const priyaKasun = await p.wedding.findUnique({ where: { slug: 'priya-and-kasun' } });
  ok('Seeded wedding "priya-and-kasun" exists', !!priyaKasun);
  ok('Seeded wedding has groom name', priyaKasun?.groomFirstName === 'Kasun');

  const testCouple = await p.user.findUnique({ where: { email: 'test+couple@local' } });
  ok('Test couple account exists', !!testCouple);

  const superAdmin = await p.user.findUnique({ where: { email: 'test+super@local' } });
  ok('Super admin account exists', superAdmin?.role === 'SUPER_ADMIN');

  // ── 15. Cleanup ───────────────────────────────────────────────────────────────
  console.log('\n15. Cleanup — removing test data');
  await cleanup();
  const leftover = await p.user.findUnique({ where: { email: `${TEST_PREFIX}@test.lk` } });
  ok('Test user removed after cleanup', leftover === null);
  const leftoverWedding = await p.wedding.findUnique({ where: { slug: `${TEST_PREFIX}-slug` } });
  ok('Test wedding removed after cleanup', leftoverWedding === null);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('🎉 All database tests passed!\n');
  else console.error(`⚠️  ${failed} test(s) failed.\n`);

  await p.$disconnect();
  if (failed > 0) process.exit(1);
}

run().catch(async (e) => {
  console.error('Fatal:', e.message);
  await cleanup().catch(() => {});
  await p.$disconnect();
  process.exit(1);
});
