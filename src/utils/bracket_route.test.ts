import { describe, expect, it } from 'vitest'
import { explicitBracketFallbackPath } from './bracket_route'

describe('explicitBracketFallbackPath', () => {
  it('redirects the shortcut to the regular schedule homepage', () => {
    expect(explicitBracketFallbackPath('/bracket')).toBe('/')
  })

  it('redirects a season and zone bracket URL to its regular schedule URL', () => {
    expect(explicitBracketFallbackPath('/2026/617/bracket')).toBe('/2026/617')
  })

  it('does not affect regular schedule URLs used by the rollout', () => {
    expect(explicitBracketFallbackPath('/2026/617')).toBeNull()
    expect(explicitBracketFallbackPath('/')).toBeNull()
  })
})
