import { describe, expect, test } from '@jest/globals'

describe('jest integration', () => {
  test('executes properly', () => {
    expect(1 + 2).toBe(3)
  })
})
