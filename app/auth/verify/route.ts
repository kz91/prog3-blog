import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../lib/supabase/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(new URL('/login?error=Invalid verification link', request.url))
    }

    const supabase = await createClient()

    // Find user with this token
    const { data: user, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('verification_token', token)
        .single()

    if (error || !user) {
        return NextResponse.redirect(new URL('/login?error=Invalid or expired verification link', request.url))
    }

    // Update user to verified
    const { error: updateError } = await supabase
        .from('users')
        .update({
            is_verified: true,
            verification_token: null
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Verification Update Error:', updateError)
        return NextResponse.redirect(new URL('/login?error=Verification failed. Please try again.', request.url))
    }

    return NextResponse.redirect(new URL('/login?message=Email verified successfully! You can now log in.', request.url))
}
