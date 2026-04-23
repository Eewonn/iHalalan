'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const pin = formData.get('pin') as string
  const adminPin = process.env.ADMIN_PIN

  if (!adminPin) {
    return { error: 'Server misconfiguration: ADMIN_PIN not set' }
  }

  if (pin !== adminPin) {
    return { error: 'Incorrect PIN. Try again.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', `authenticated:${adminPin}`, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  redirect('/admin')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}
