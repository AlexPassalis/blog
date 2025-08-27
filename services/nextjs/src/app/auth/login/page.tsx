import classes from '@/data/css/AuthenticationImage.module.css'

import { Paper, Title } from '@mantine/core'
import { LoginForm } from '@/app/auth/login/LoginForm'

type typeLogInPageProps = {
  searchParams: Promise<{ username?: string }>
}

export default async function LogInPage({ searchParams }: typeLogInPageProps) {
  const { username } = await searchParams

  return (
    <main className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title
          order={2}
          className={classes.title}
          style={{ whiteSpace: 'pre-line' }}
        >
          {username
            ? `You have successfully registered\n${username}!\nLog in to get started.`
            : 'Welcome back!'}
        </Title>
        <LoginForm />
      </Paper>
    </main>
  )
}
