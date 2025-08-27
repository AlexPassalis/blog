import { authClient } from '@/lib/better-auth/client'
import { Modal, LoadingOverlay, TextInput, Button } from '@mantine/core'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'

type LogInModalProps = {
  opened: boolean
  close: () => void
}

export function LogInModal({ opened, close }: LogInModalProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: zodResolver(
      z.object({
        email: z.string().email({ message: 'Invalid email, try again.' }),
        password: z.string(),
        name: z.string(),
      })
    ),
  })

  const [visible, { toggle }] = useDisclosure(false)

  return (
    <Modal
      opened={opened}
      onClose={() => {
        close()
      }}
      centered
      withCloseButton={false}
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          await authClient.signUp.email(
            {
              email: values.email,
              password: values.password,
              name: values.name,
            },
            {
              onRequest: () => toggle(),
              onSuccess: () => {
                toggle()
              },
              onError: (ctx) => {
                toggle()
                console.error(ctx.error)
              },
            }
          )
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
          type="email"
          placeholder="email@example.com"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="********"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <TextInput
          label="Name"
          type="text"
          placeholder="Alexandros Passalis"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  )
}
