'use client'

import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { zodUserLogin } from '@/data/zod/index'
import { fetchClient } from '@/lib/openapi-fetch/client'

import { Button, PasswordInput, TextInput, Text, Anchor } from '@mantine/core'
import Link from 'next/link'

export function LoginForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: zod4Resolver(zodUserLogin),
  })

  return (
    <form
      onSubmit={form.onSubmit(async (formValues) => {
        const { error, data } = await fetchClient.POST(
          '/api/auth/token/obtain/',
          {
            body: formValues,
          },
        )
        if (error) {
          console.error(error)
        } else {
          console.log(data)
        }
      })}
    >
      <TextInput
        label="Email"
        placeholder="email@domain.com"
        size="md"
        radius="md"
        autoComplete="email"
        key={form.key('email')}
        {...form.getInputProps('email')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <PasswordInput
        label="Password"
        placeholder="Your password"
        size="md"
        radius="md"
        autoComplete="new-password"
        key={form.key('password')}
        {...form.getInputProps('password')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <Button type="submit" fullWidth mt="lg" size="md" radius="md">
        Login
      </Button>
      <Text ta="center" mt="md">
        Already have an account?{' '}
        <Anchor component={Link} href="/auth/register" fw={500} prefetch>
          Register
        </Anchor>
      </Text>
    </form>
  )
}
