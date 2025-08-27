import classes from '@/data/css/AuthenticationImage.module.css'

import { Paper, Title } from '@mantine/core'
import { RegisterForm } from '@/app/auth/register/RegisterForm'

export default function LogInPage() {
  return (
    <main className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome!
        </Title>
        <RegisterForm />
      </Paper>
    </main>
  )
}
