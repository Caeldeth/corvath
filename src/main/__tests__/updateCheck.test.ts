import { describe, expect, it } from 'vitest'
import { isNewerVersion } from '../updateCheck'

describe('isNewerVersion', () => {
  it('detects a higher version across each component', () => {
    expect(isNewerVersion('1.0.0', '1.0.1')).toBe(true)
    expect(isNewerVersion('1.0.0', '1.1.0')).toBe(true)
    expect(isNewerVersion('1.0.0', '2.0.0')).toBe(true)
  })

  it('returns false for equal or older versions', () => {
    expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false)
    expect(isNewerVersion('1.2.0', '1.1.9')).toBe(false)
    expect(isNewerVersion('2.0.0', '1.9.9')).toBe(false)
  })

  it('ignores a leading v and pre-release suffix', () => {
    expect(isNewerVersion('1.0.0', 'v1.0.1')).toBe(true)
    expect(isNewerVersion('v1.0.0', '1.0.0')).toBe(false)
    expect(isNewerVersion('1.0.0', '1.0.1-beta.2')).toBe(true)
    expect(isNewerVersion('1.0.0', '1.0.0-rc.1')).toBe(false)
  })

  it('treats missing components as zero', () => {
    expect(isNewerVersion('1.0', '1.0.1')).toBe(true)
    expect(isNewerVersion('1.0.0', '1.0')).toBe(false)
  })
})
