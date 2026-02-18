"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        const verify = async () => {
            try {
                const response = await ApiClient.verifyEmail(token);
                if (response.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Error al verificar email.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Ocurrió un error de conexión.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="container flex items-center justify-center min-h-[calc(10vh-4rem)] py-10">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Verificación de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <p className="text-muted-foreground">Verificando tu correo...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-green-600">¡Email Verificado!</h3>
                                <p className="text-muted-foreground">Tu cuenta ha sido activada correctamente.</p>
                            </div>
                            <Button asChild className="w-full mt-4">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-16 w-16 text-destructive" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-destructive">Error de Verificación</h3>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4">
                                <Link href="/">Volver al Inicio</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
