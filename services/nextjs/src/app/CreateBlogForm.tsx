'use client'

import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { zodBlogWrite } from '@/data/zod/index'
import { fetchClient } from '@/lib/openapi-fetch/client'

import { TextInput, Button } from '@mantine/core'

export function CreateBlogForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { title: '', content: '' },
    validate: zod4Resolver(zodBlogWrite),
  })

  return (
    <form
      onSubmit={form.onSubmit(async (formValues) => {
        const { error, data } = await fetchClient.POST(
          '/api/blogs/',
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
        label="Title"
        placeholder="The title to my blog."
        size="md"
        radius="md"
        key={form.key('title')}
        {...form.getInputProps('title')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <TextInput
        label="Content"
        placeholder="The content to my blog."
        size="md"
        radius="md"
        key={form.key('content')}
        {...form.getInputProps('content')}
        styles={{
          error: {
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          },
        }}
      />
      <Button type="submit" fullWidth mt="lg" size="md" radius="md">
        Create Blog
      </Button>
    </form>
  )
}
