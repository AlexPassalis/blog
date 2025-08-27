'use client'

import type { paths } from '@/lib/openapi-typescript/schema'

type typeResponseError =
  paths['/api/auth/register/']['post']['responses']['400']['content']['application/json']

import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { zodUserWrite } from '@/data/zod'

import { Button, PasswordInput, TextInput, Text, Anchor } from '@mantine/core'
import Link from 'next/link'
import { fetchClient } from '@/lib/openapi-fetch/client'
import { redirect } from 'next/navigation'

export function RegisterForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
    },
    validate: zod4Resolver(zodUserWrite),
  })

  function setResponseError(error: typeResponseError) {
    for (const field of Object.keys(error) as (keyof typeResponseError)[]) {
      const errors = error?.[field]
      if (!errors) {
        return
      }
      form.setFieldError(field, errors.join('\n'))
    }
  }

  return (
    <form
      onSubmit={form.onSubmit(async (formValues) => {
        const { error, data } = await fetchClient.POST('/api/auth/register/', {
          body: formValues,
        })
        if (error) {
          console.log(error)
          setResponseError(error)
        } else {
          redirect(`/auth/login?username=${data.username}`)
        }
      })}
      className="flex flex-col gap-4"
    >
      <TextInput
        label="First Name"
        placeholder="Your first name"
        size="md"
        radius="md"
        autoComplete="name"
        key={form.key('first_name')}
        {...form.getInputProps('first_name')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <TextInput
        label="Last Name"
        placeholder="Your last name"
        size="md"
        radius="md"
        autoComplete="family-name"
        key={form.key('last_name')}
        {...form.getInputProps('last_name')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <TextInput
        label="Username"
        placeholder="Your username"
        size="md"
        radius="md"
        autoComplete="username"
        key={form.key('username')}
        {...form.getInputProps('username')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
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
        Register
      </Button>
      <Text ta="center" mt="md">
        Don&rsquo;t have an account?{' '}
        <Anchor
          component={Link}
          href="/auth/login"
          target="_blank"
          fw={500}
          prefetch
        >
          Login
        </Anchor>
      </Text>
    </form>
  )
}
