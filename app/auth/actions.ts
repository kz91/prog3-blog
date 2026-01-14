'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'
import { cookies } from 'next/headers'

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

    // Insert into public.users
    const { error } = await supabase
        .from('users')
        .insert({
            email,
            password, // Plaintext
            name: email.split('@')[0], // Default name
            role: 'user'
        })

    if (error) {
        console.error('Signup Error:', error.message)
        return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // Auto Login after signup? Or redirect to login.
    // Let's redirect to login for simplicity
    redirect('/login?message=Account created. Please log in.')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_session')

    revalidatePath('/', 'layout')
    redirect('/login')
}
