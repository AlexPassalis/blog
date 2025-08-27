import type { LoaderFunctionArgs } from 'react-router'

import { isUser } from '@/lib/better-auth/is'
import { useLoaderData } from 'react-router'
import { useDisclosure } from '@mantine/hooks'
import { useEffect } from 'react'
import { NewsletterModal } from '@/app/(user)/components/NewsletterModal'
import { LogInModal } from '@/app/(user)/components/LogInModal'
import { Header } from '@/app/(user)/components/Header'
import { Outlet } from 'react-router'
import { Footer } from '@/app/(user)/components/Footer'

export async function loader({ request }: LoaderFunctionArgs) {
  const { name } = await isUser(request)
  return { name }
}

export default function UserLayout() {
  const { name } = useLoaderData<typeof loader>()

  const [
    newsletterModalIsOpen,
    { open: openNewsletterModal, close: closeNewsletterModal },
  ] = useDisclosure(false)
  const [logInModalIsOpen, { open: openLogInModal, close: closeLogInModal }] =
    useDisclosure(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!logInModalIsOpen) {
        openNewsletterModal()
      }
    }, 1000) // 10 sec
    return () => clearTimeout(timer)
  }, [logInModalIsOpen, openNewsletterModal])

  return (
    <>
      <NewsletterModal
        opened={newsletterModalIsOpen}
        close={closeNewsletterModal}
      />
      <LogInModal opened={logInModalIsOpen} close={closeLogInModal} />
      <main className="p-4">
        <Header name={name} open={openLogInModal} />
        <Outlet
          context={{ open: openLogInModal, isLoggedIn: name ? true : false }}
        />
        <Footer />
      </main>
    </>
  )
}

export type UserPageContext = {
  open: () => void
  isLoggedIn: boolean
}
