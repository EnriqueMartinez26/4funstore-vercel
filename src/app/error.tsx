'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 text-center px-4">
            <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertTriangle className="h-16 w-16" />
                <h2 className="text-3xl font-bold font-headline">Algo salió mal</h2>
            </div>
            <p className="text-muted-foreground max-w-md">
                Ocurrió un error inesperado. Por favor intenta recargar la página o vuelva más tarde.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Intentar de nuevo</Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Ir al Inicio
                </Button>
            </div>
        </div>
    )
}
