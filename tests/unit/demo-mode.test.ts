// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { isDemoMode } from '@/lib/demo-mode';

describe('isDemoMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows an explicit local demo preview', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DEMO_MODE', 'true');

    expect(isDemoMode()).toBe(true);
  });

  it('recognizes the safe local placeholder configuration', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('BYPASS_AUTH', 'true');
    vi.stubEnv('FB_APP_ID', 'demo');

    expect(isDemoMode()).toBe(true);
  });

  it('cannot be enabled in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DEMO_MODE', 'true');

    expect(isDemoMode()).toBe(false);
  });
});

