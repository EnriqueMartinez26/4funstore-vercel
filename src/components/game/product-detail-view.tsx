"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import type { Game } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Monitor, Gamepad2, Disc, Globe, Layers, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailViewProps {
    game: Game;
}

export function ProductDetailView({ game }: ProductDetailViewProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const { toast } = useToast();

    // Helper para detectar y formatear URLs de YouTube
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        if (match && match[1]) {
            return { type: 'youtube', src: `https://www.youtube.com/embed/${match[1]}?autoplay=0&mute=1&loop=1&playlist=${match[1]}` };
        }
        return { type: 'video', src: url };
    };

    const isWishlisted = isInWishlist(game.id);
    // Fallback image logic
    const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
        ? game.imageId
        : "https://placehold.co/600x800/222/FFF?text=No+Image";

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative">
            {/* --- HERO BACKGROUND (Blurred) --- */}
            <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden -z-10 opacity-30 pointer-events-none select-none">
                <Image
                    src={imageUrl}
                    alt="Background"
                    fill
                    className="object-cover blur-3xl scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
            </div>

            <main className="container mx-auto px-4 pt-24 max-w-7xl animate-in fade-in duration-500">
                {/* --- HEADER --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2 text-muted-foreground text-sm font-medium">
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => router.push('/productos')}>Juegos</span>
                        <span>/</span>
                        <span className="text-foreground">{game.genre?.name || "General"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight drop-shadow-xl">{game.name}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
                    {/* --- LEFT COL: MEDIA & DESCRIPTION --- */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Media Gallery / Main Image */}
                        <div className="aspect-video w-full relative overflow-hidden rounded-xl shadow-xl bg-black ring-1 ring-white/10 group">
                            {(() => {
                                const media = getEmbedUrl(game.trailerUrl || "");
                                if (media?.type === 'youtube') {
                                    return (
                                        <iframe
                                            src={media.src}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                } else {
                                    // If no trailer, show image
                                    return (
                                        <Image src={imageUrl} alt={game.name} fill className="object-cover" priority />
                                    );
                                }
                            })()}
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">Acerca de este juego</h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                                <p>{game.description || "Sin descripción disponible."}</p>
                            </div>
                        </div>

                        {/* System Requirements (Real from Backend) */}
                        {game.requirements ? (
                            <div className="bg-card/30 rounded-xl p-6 border border-white/5">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-primary" />
                                    Requisitos del Sistema Recomendados
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Sistema Operativo:</span>
                                        <span className="text-foreground">{game.requirements.os}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Procesador:</span>
                                        <span className="text-foreground text-right max-w-[60%]">{game.requirements.processor}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Memoria RAM:</span>
                                        <span className="text-foreground">{game.requirements.memory}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground font-medium">Tarjeta Gráfica:</span>
                                        <span className="text-foreground text-right max-w-[60%]">{game.requirements.graphics}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground font-medium">Almacenamiento:</span>
                                        <span className="text-foreground">{game.requirements.storage}</span>
                                    </div>
                                </div>
                                {game.specPreset && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <span className="text-xs text-muted-foreground">
                                            Perfil de requisitos: <span className="font-bold text-primary">{game.specPreset === 'Low' ? 'Gama Baja' : game.specPreset === 'Mid' ? 'Gama Media' : 'Gama Alta'}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* --- RIGHT COL: SIDEBAR (Sticky) --- */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6 bg-card/40 backdrop-blur-md p-6 rounded-xl border border-white/5 shadow-2xl">

                            {/* Game Logo/Box Art Small (Optional, usually Main Image is enough, but keeping Sidebar Art is standard) */}
                            <div className="aspect-[3/4] relative w-full rounded-lg overflow-hidden shadow-lg mb-4 ring-1 ring-white/10 hidden lg:block">
                                <Image src={imageUrl} alt="Cover" fill className="object-cover" />
                            </div>

                            {/* Price & Actions */}
                            <div className="space-y-4">
                                {game.finalPrice > 0 ? (
                                    <div className="flex flex-col">
                                        {(game.discountPercentage ?? 0) > 0 && game.finalPrice < game.price && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                                                    {formatCurrency(game.price)}
                                                </span>
                                                <Badge className="bg-green-500 text-white animate-pulse">
                                                    -{game.discountPercentage}%
                                                </Badge>
                                            </div>
                                        )}
                                        <div className={cn(
                                            "text-3xl font-bold",
                                            (game.discountPercentage ?? 0) > 0 ? "text-green-400" : "text-foreground"
                                        )}>
                                            {formatCurrency(game.finalPrice)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-primary">GRATIS</div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        size="lg"
                                        className="w-full text-lg font-bold h-12 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all"
                                        onClick={() => {
                                            addToCart(game);
                                            toast({ title: "Añadido al carrito", description: `${game.name} ya está en tu carrito.` });
                                        }}
                                        disabled={game.stock === 0}
                                    >
                                        {game.stock !== undefined && game.stock === 0 ? "Agotado" : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                {game.price > 0 ? "Comprar Ahora" : "Obtener"}
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className={cn("w-full h-12 border-white/10 hover:bg-white/5", isWishlisted && "border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/10")}
                                        onClick={() => toggleWishlist(game)}
                                    >
                                        <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current")} />
                                        {isWishlisted ? "En tu Lista de Deseos" : "Añadir a Lista de Deseos"}
                                    </Button>

                                    {/* Botón Admin en Sidebar */}
                                    {user?.role === 'admin' && (
                                        <Button asChild variant="ghost" size="lg" className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/10">
                                            <Link href={`/admin/products/${game.id}`}>
                                                <Gamepad2 className="mr-2 h-4 w-4" />
                                                Editar Producto
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            {/* Metadata */}
                            <div className="space-y-3 text-sm">
                                <MetaRow icon={<Globe className="w-4 h-4" />} label="Desarrollador" value={game.developer} />
                                <MetaRow icon={<Layers className="w-4 h-4" />} label="Plataforma" value={game.platform?.name} />
                                <MetaRow icon={<Gamepad2 className="w-4 h-4" />} label="Género" value={game.genre?.name} />
                                <MetaRow icon={<Disc className="w-4 h-4" />} label="Tipo" value={game.type === 'Physical' ? 'Físico' : 'Digital (Key)'} />
                                <MetaRow icon={<Info className="w-4 h-4" />} label="Lanzamiento" value={new Date(game.releaseDate).toLocaleDateString()} />
                            </div>

                            {/* Requisitos del Sistema */}
                            {game.requirements && game.requirements.os && (
                                <>
                                    <Separator className="bg-white/10" />
                                    <div className="space-y-3">
                                        <h3 className="font-headline text-sm font-bold text-foreground flex items-center gap-2">
                                            <Monitor className="w-4 h-4 text-primary" />
                                            Requisitos del Sistema
                                            {game.specPreset && (
                                                <Badge variant="secondary" className="text-xs ml-auto font-mono">
                                                    {game.specPreset === 'Low' ? 'Bajos' : game.specPreset === 'Mid' ? 'Medios' : 'Altos'}
                                                </Badge>
                                            )}
                                        </h3>
                                        <div className="space-y-2 text-xs">
                                            <SpecRow label="SO" value={game.requirements.os} />
                                            <SpecRow label="Procesador" value={game.requirements.processor} />
                                            <SpecRow label="Memoria" value={game.requirements.memory} />
                                            <SpecRow label="Gráficos" value={game.requirements.graphics} />
                                            <SpecRow label="Almacenamiento" value={game.requirements.storage} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground flex items-center gap-2">{icon} {label}</span>
            <span className="text-foreground font-medium text-right">{value}</span>
        </div>
    );
}

function SpecRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-0.5 py-1">
            <span className="text-muted-foreground font-medium">{label}</span>
            <span className="text-foreground/80">{value}</span>
        </div>
    );
}
