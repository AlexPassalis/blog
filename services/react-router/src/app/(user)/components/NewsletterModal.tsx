import { useDisclosure } from '@mantine/hooks'
import { Modal, TextInput, LoadingOverlay } from '@mantine/core'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useForm } from '@mantine/form'

type NewsletterModalProps = {
  opened: boolean
  close: () => void
}

export function NewsletterModal({ opened, close }: NewsletterModalProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(
      z.object({
        email: z.string().email({ message: 'Invalid email, try again.' }),
      })
    ),
  })

  const [visible, { toggle }] = useDisclosure(false)
  const [response, setResponse] = useState<undefined | 'success'>(undefined)

  return (
    <Modal
      opened={opened}
      onClose={() => {
        close()
      }}
      centered
      withCloseButton={false}
    >
      {!response ? (
        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              toggle()
              const res = await fetch('/api/user/newsletter/email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: values.email }),
              })
              if (!res.ok) {
                throw new Response(null, {
                  status: 500,
                })
              } else {
                setResponse('success')
              }
            } catch {
              throw new Response(null, {
                status: 500,
              })
            } finally {
              toggle()
            }
          })}
          className="relative flex flex-col gap-2"
        >
          <LoadingOverlay
            visible={visible}
            zIndex={1000}
            overlayProps={{ bg: 'white' }}
            loaderProps={{ color: 'blue', type: 'bars', size: 'lg' }}
          />
          <TextInput
            label="Email"
            placeholder="email@example.com"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <button
            type="submit"
            className="border border-black rounded-md hover:cursor-pointer"
          >
            Submit
          </button>
        </form>
      ) : (
        <div>
          <p>You have successfully signed up to our newsletter.</p>
        </div>
      )}
    </Modal>
  )
}
