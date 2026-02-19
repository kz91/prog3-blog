'use client'

import { useEffect } from 'react'

export function ClearSearchParams() {
    useEffect(() => {
        // Check if there are any search params
        if (window.location.search) {
            // Replace the current history state with a new one that has no search params
            // This changes the URL in the address bar without reloading the page
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
        }
    }, [])

    return null
}
