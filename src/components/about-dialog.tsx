"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Code, ShieldCheck } from "lucide-react";
import React from "react";

export function AboutDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-hidden">
                <DialogHeader className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                        <Image src="/logo.png" alt="4Fun Logo" width={80} height={40} className="h-10 w-auto object-contain" />
                        <DialogTitle className="text-2xl font-headline mt-1 sm:mt-0">Sobre Nosotros</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-muted-foreground">
                        Conocé más sobre la historia y la misión detrás de 4Fun Marketplace.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <p>
                            <strong className="text-foreground">4Fun Marketplace</strong> nació como un proyecto académico integrador, desarrollado para aplicar los conocimientos adquiridos en el diseño y construcción de una plataforma de comercio electrónico de punta a punta.
                        </p>
                        <p>
                            Nuestra misión es proporcionar una interfaz intuitiva, rápida y estéticamente atractiva para que gamers de todas partes puedan explorar, descubrir y adquirir sus videojuegos favoritos, ya sean copias digitales o ediciones físicas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 border border-border/50">
                            <Code className="h-8 w-8 text-blue-400 mb-2" />
                            <h4 className="font-semibold text-foreground mb-1">Tecnología</h4>
                            <p className="text-xs text-muted-foreground">Desarrollado con las últimas tecnologías web para máxima velocidad.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 border border-border/50">
                            <ShieldCheck className="h-8 w-8 text-green-400 mb-2" />
                            <h4 className="font-semibold text-foreground mb-1">Seguridad</h4>
                            <p className="text-xs text-muted-foreground">Gestión de datos y transacciones seguras de principio a fin.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 border border-border/50">
                            <Heart className="h-8 w-8 text-red-400 mb-2" />
                            <h4 className="font-semibold text-foreground mb-1">Pasión</h4>
                            <p className="text-xs text-muted-foreground">Creado por gamers, con un profundo amor por la industria.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
