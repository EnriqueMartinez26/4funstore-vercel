"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api-client";
import type { Game } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Share2, Info, Monitor, Gamepad2, Disc, Globe, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const { toast } = useToast();

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Helper para detectar y formatear URLs de YouTube
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        if (match && match[1]) {
            return { type: 'youtube', src: `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` };
        }
        return { type: 'video', src: url };
    };

    const productId = Array.isArray(id) ? id[0] : id;

    useEffect(() => {
        if (!productId) return;

        const fetchGame = async () => {
            try {
                setLoading(true);
                const data = await ApiClient.getProductById(productId);
                setGame(data);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("No pudimos cargar el juego. Puede que no exista o haya un error.");
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [productId]);

    if (loading) return <ProductSkeleton />;
    if (error || !game) return <ErrorState message={error} />;

    const isWishlisted = isInWishlist(game.id);
    // Fallback image logic
    const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
        ? game.imageId
        : "https://placehold.co/600x800/222/FFF?text=No+Image";

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
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
                                    return (
                                        <video
                                            src={media?.src || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                                            poster={imageUrl}
                                            autoPlay
                                            muted
                                            loop
                                            controls
                                            className="w-full h-full object-cover"
                                        />
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

                        {/* System Requirements (MOCK) */}
                        <div className="bg-card/30 rounded-xl p-6 border border-white/5">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-primary" />
                                Requisitos del Sistema
                            </h3>
                            {/* We use mock data here as the backend doesn't provide it yet */}
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <strong className="block text-foreground mb-2">Mínimos</strong>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>OS: Windows 10 64-bit</li>
                                        <li>Processor: Intel Core i5-4460 or AMD FX-6300</li>
                                        <li>Memory: 8 GB RAM</li>
                                        <li>Graphics: NVIDIA GeForce GTX 760 or AMD Radeon R7 260x</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="block text-foreground mb-2">Recomendados</strong>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>OS: Windows 10/11 64-bit</li>
                                        <li>Processor: Intel Core i7-3770 or AMD FX-9590</li>
                                        <li>Memory: 16 GB RAM</li>
                                        <li>Graphics: NVIDIA GeForce GTX 1060 or AMD Radeon RX 480</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
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
                                {game.price > 0 ? (
                                    <div className="text-3xl font-bold text-foreground">
                                        {formatCurrency(game.price)}
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

function ProductSkeleton() {
    return (
        <div className="container mx-auto px-4 pt-24 min-h-screen">
            <div className="flex flex-col gap-4 mb-8">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-3/4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-[500px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button asChild>
                <a href="/productos">Volver a la tienda</a>
            </Button>
        </div>
    )
}
