import { z } from 'zod'

import {
  allowedSingle,
  allowedFull,
  hasSpace,
  hasLower,
  hasUpper,
  hasDigit,
  hasSymbol,
  ALLOWED_SYMBOLS,
} from '@/data/regex/password'

import { regexLettersOnly, regexUsername } from '@/data/regex/index'

const zodPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .max(64, { message: 'Password must be at most 64 characters.' })
  .superRefine((value, ctx) => {
    if (value.length < 8 || value.length > 64) {
      return
    }

    if (!allowedFull.test(value)) {
      const invalid = Array.from(
        new Set(
          Array.from(value).filter(
            (ch) => !allowedSingle.test(ch) && !hasSpace.test(ch),
          ),
        ),
      )
        .sort()
        .join('')

      if (invalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password contains invalid character(s): ${invalid}. Allowed symbols: ${ALLOWED_SYMBOLS}.`,
        })
      }
    }

    if (hasSpace.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must not contain spaces.',
      })
    }
    if (!hasLower.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one lowercase letter.',
      })
    }
    if (!hasUpper.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one uppercase letter.',
      })
    }
    if (!hasDigit.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one digit.',
      })
    }
    if (!hasSymbol.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Password must contain at least one of: ${ALLOWED_SYMBOLS}.`,
      })
    }
  })

export const zodUser = z.object({
  first_name: z
    .string()
    .min(1, { message: 'First name must contain at least 1 character.' })
    .max(32, {
      message: 'First name must not contain more than 32 characters.',
    })
    .refine((value) => value === '' || regexLettersOnly.test(value), {
      message: 'First name may only contain letters.',
    }),
  last_name: z
    .string()
    .min(1, { message: 'Last name must contain at least 1 character.' })
    .max(32, {
      message: 'Last name must not contain more than 32 characters.',
    })
    .refine((value) => value === '' || regexLettersOnly.test(value), {
      message: 'Last name may only contain letters.',
    }),
  username: z
    .string()
    .min(6, { message: 'Username must contain at least 6 character.' })
    .max(16, { message: 'Username must not contain more than 16 characters.' })
    .refine((value) => value.length < 6 || regexUsername.test(value), {
      message: 'Username may only contain letters, numbers, and . @ + - _',
    }),
  email: z
    .email({ message: 'Invalid email address.' })
    .min(1, { message: 'Email must contain at least 1 character.' })
    .max(254, { message: 'Email must not contain more than 254 characters.' }),
  password: zodPassword,
})
