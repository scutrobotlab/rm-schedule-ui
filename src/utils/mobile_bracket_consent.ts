export const MobileBracketConsentKey = 'mobile_bracket_consent_v1'

export type MobileBracketConsent = 'accepted' | 'declined' | null

export function readMobileBracketConsent(): MobileBracketConsent {
  try {
    const value = localStorage.getItem(MobileBracketConsentKey)
    return value === 'accepted' || value === 'declined' ? value : null
  } catch {
    return null
  }
}

export function writeMobileBracketConsent(
  consent: Exclude<MobileBracketConsent, null>,
): void {
  try {
    localStorage.setItem(MobileBracketConsentKey, consent)
  } catch {
    // 存储不可用时仍允许本次会话继续，刷新后可能再次询问。
  }
}
