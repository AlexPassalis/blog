export const ALLOWED_SYMBOLS = `!@#$%^&*()_+-=[]{};:,.?~`
const esc = ALLOWED_SYMBOLS.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')

export const allowedSingle = new RegExp(`[A-Za-z0-9${esc}]`)
export const allowedFull = new RegExp(`^[A-Za-z0-9${esc}]+$`)
export const hasSpace = /\s/
export const hasLower = /[a-z]/
export const hasUpper = /[A-Z]/
export const hasDigit = /\d/
export const hasSymbol = new RegExp(`[${esc}]`)
