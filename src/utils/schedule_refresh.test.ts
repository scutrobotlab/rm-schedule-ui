import { describe, expect, it } from 'vitest'
import {
  isStaticArchivedZone,
  SCHEDULE_REFRESH_INTERVAL_MS,
} from './schedule_refresh'

describe('schedule refresh policy', () => {
  it('refreshes active schedules every 30 seconds', () => {
    expect(SCHEDULE_REFRESH_INTERVAL_MS).toBe(30_000)
    expect(isStaticArchivedZone(2026, 617)).toBe(false)
  })

  it('does not refresh archived seasons and zones', () => {
    expect(isStaticArchivedZone(2024, 524)).toBe(true)
    expect(isStaticArchivedZone(2025, 570)).toBe(true)
    expect(isStaticArchivedZone(2026, 614)).toBe(true)
    expect(isStaticArchivedZone(2026, 615)).toBe(true)
    expect(isStaticArchivedZone(2026, 616)).toBe(true)
  })
})
