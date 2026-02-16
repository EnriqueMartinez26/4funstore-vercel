"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useComparator } from "@/context/ComparatorContext";
import { ShoppingCart, Heart, Scale } from "lucide-react"; // Scale for compare
import Image from "next/image";
import { formatCurrency, cn } from "@/lib/utils";
import type { Game } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import Link from "next/link"; // Add import for Link

interface QuickViewModalProps {
    game: Game;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ game, open, onOpenChange }: QuickViewModalProps) {
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const { addToCompare, isInCompare, removeFromCompare } = useComparator();
    const isWishlisted = isInWishlist(game.id);
    const isCompared = isInCompare(game.id);
    const hasStock = game.stock !== undefined && game.stock > 0;

    const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
        ? game.imageId
        : "https://placehold.co/600x400/png?text=4Fun";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0">
                <div className="grid md:grid-cols-2 h-full">
                    {/* Image Column */}
                    <div className="relative h-[300px] md:h-auto bg-muted">
                        <Image
                            src={imageUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 350px"
                        />
                    </div>

                    {/* Info Column */}
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <DialogHeader className="mb-4 text-left">
                            <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary">{game.platform?.name || 'Plataforma'}</Badge>
                                <Badge variant="outline">{game.genre?.name || 'Género'}</Badge>
                            </div>
                            <DialogTitle className="text-2xl font-bold font-headline leading-tight">{game.name}</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground mt-2 line-clamp-3">
                                {game.description || "Sin descripción disponible."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1" />

                        <div className="mt-6 space-y-4">
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    {(game.discountPercentage ?? 0) > 0 && game.finalPrice < game.price && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                                                {formatCurrency(game.price)}
                                            </span>
                                            <Badge className="bg-green-500 text-white text-xs">
                                                -{game.discountPercentage}%
                                            </Badge>
                                        </div>
                                    )}
                                    <span className={cn(
                                        "text-3xl font-bold",
                                        (game.discountPercentage ?? 0) > 0 ? "text-green-400" : "text-primary"
                                    )}>
                                        {formatCurrency(game.finalPrice)}
                                    </span>
                                </div>
                                {!hasStock && <Badge variant="destructive">Agotado</Badge>}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 gap-2"
                                    disabled={!hasStock}
                                    onClick={() => {
                                        addToCart(game);
                                        onOpenChange(false);
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Agregar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn(isWishlisted && "text-red-500 hover:text-red-600")}
                                    onClick={() => toggleWishlist(game)}
                                    title="Desear"
                                >
                                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn(isCompared && "text-blue-500 border-blue-500")}
                                    onClick={() => isCompared ? removeFromCompare(game.id) : addToCompare(game)}
                                    title="Comparar"
                                >
                                    <Scale className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-center">
                                <Link
                                    href={`/productos/${game.id}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Ver detalles completos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
