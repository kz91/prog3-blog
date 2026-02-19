'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'
import { cookies } from 'next/headers'
import { sendVerificationEmail } from '../../lib/email'
import crypto from 'crypto'

// Custom Auth Actions using public.users table

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()

    // Simple query to public.users
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Comparing plaintext as requested for "simple test system"
        .single()

    if (error || !user) {
        return redirect(`/login?error=Invalid login credentials`)
    }

    if (!user.is_verified) {
        return redirect(`/login?error=Email not verified. Please check your inbox.`)
    }

    // Create Session Cookie
    const sessionData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify(sessionData), {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    revalidatePath('/', 'layout')

    if (user.role === 'admin') {
        redirect('/admin/posts')
    } else {
        redirect('/posts')
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = (formData.get('email') as string).trim()
    const password = (formData.get('password') as string).trim()

    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Insert into public.users
    const { error } = await supabase
        .from('users')
        .insert({
            email,
            password, // Plaintext
            name: email.split('@')[0], // Default name
            role: 'user',
            is_verified: false,
            verification_token: verificationToken
        })

    if (error) {
        console.error('Signup Error:', error.message)
        // Check for unique constraint violation (duplicate email)
        if (error.code === '23505') {
            return redirect(`/signup?error=${encodeURIComponent('This email is already registered. Please log in.')}`)
        }
        return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // Send Verification Email
    try {
        await sendVerificationEmail(email, verificationToken)
    } catch (e) {
        console.error('Failed to send verification email', e)
        // Delete the user so they can try again
        await supabase.from('users').delete().eq('email', email)

        return redirect(`/signup?error=${encodeURIComponent('Failed to send verification email. Please try again.')}`)
    }

    // Redirect to login with message
    redirect('/login?message=Account created. Please check your email to verify your account.')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_session')

    revalidatePath('/', 'layout')
    redirect('/login')
}
