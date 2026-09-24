// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { readFile } from 'node:fs/promises';

import { createClient } from '@vercel/postgres';

const schemaFiles = ['database/meta-schema.sql', 'database/schema.sql'];
const client = createClient();

try {
  await client.connect();

  for (const schemaFile of schemaFiles) {
    const sql = await readFile(new URL(`../${schemaFile}`, import.meta.url), 'utf8');
    await client.query(sql);
    console.log(`Applied ${schemaFile}`);
  }

  const result = await client.query(
    "SELECT COUNT(*)::int AS table_count FROM information_schema.tables WHERE table_schema = 'public'",
  );
  console.log(`Schema ready with ${result.rows[0]?.table_count ?? 0} public tables`);
} finally {
  await client.end();
}

