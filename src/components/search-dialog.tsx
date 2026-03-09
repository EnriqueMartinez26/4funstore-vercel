"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient } from "@/lib/api";
import type { Product } from "@/lib/schemas";

const DEBOUNCE_MS = 300;
const MAX_PREVIEW = 5;

export function SearchDialog({
    trigger,
    open: controlledOpen,
    onOpenChange
}: {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();

    const isControlled = controlledOpen !== undefined;
    const showOpen = isControlled ? controlledOpen : open;
    const setShowOpen = isControlled ? onOpenChange! : setOpen;

    // Debounced live search
    const fetchResults = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }

        // Cancel previous request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await ApiClient.getProducts(
                { search: q, limit: MAX_PREVIEW, page: 1 },
                { signal: controller.signal }
            );
            if (!controller.signal.aborted) {
                setResults(res.products);
                setTotalResults(res.meta.total);
                setLoading(false);
            }
        } catch {
            if (!controller.signal.aborted) {
                setResults([]);
                setTotalResults(0);
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        debounceRef.current = setTimeout(() => fetchResults(query), DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, fetchResults]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!showOpen) {
            setQuery("");
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            abortRef.current?.abort();
        }
    }, [showOpen]);

    // Handle Ctrl+K / Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const navigateTo = (path: string) => {
        setShowOpen(false);
        router.push(path);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigateTo(`/productos?search=${encodeURIComponent(query)}`);
        }
    };

    const formatPrice = (p: number) =>
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(p);

    return (
        <>
            {!isControlled && trigger && (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            )}

            <Dialog open={showOpen} onOpenChange={setShowOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0">
                    <DialogHeader className="px-4 py-3 border-b">
                        <DialogTitle className="sr-only">Buscar</DialogTitle>
                        <form onSubmit={handleSearch} className="flex items-center">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Buscar juegos..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 opacity-50" />}
                        </form>
                    </DialogHeader>

                    <div className="max-h-[350px] overflow-y-auto p-2">
                        {query.trim().length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Busca juegos, géneros o plataformas...
                            </div>
                        ) : query.trim().length < 2 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Escribe al menos 2 caracteres...
                            </div>
                        ) : loading && results.length === 0 ? (
                            <div className="py-6 flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No se encontraron resultados para &quot;{query}&quot;
                            </div>
                        ) : (
                            <div className="grid gap-1">
                                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {totalResults} resultado{totalResults !== 1 ? "s" : ""}
                                </p>
                                {results.map((product) => (
                                    <button
                                        key={product.id}
                                        className="flex items-center gap-3 w-full rounded-md px-2 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
                                        onClick={() => navigateTo(`/productos/${product.id}`)}
                                    >
                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                                            <Image
                                                src={product.imageId}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {typeof product.platform === 'object' ? product.platform.name : product.platform}
                                                {product.developer && ` · ${product.developer}`}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {product.discountPercentage > 0 ? (
                                                <>
                                                    <span className="text-xs line-through text-muted-foreground">{formatPrice(product.price)}</span>
                                                    <p className="text-sm font-semibold text-green-500">{formatPrice(product.finalPrice)}</p>
                                                </>
                                            ) : (
                                                <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {totalResults > MAX_PREVIEW && (
                                    <Button
                                        variant="ghost"
                                        className="justify-between h-9 px-2 text-sm font-normal mt-1"
                                        onClick={handleSearch}
                                    >
                                        <span>Ver todos los resultados</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="py-2 px-4 bg-muted/50 text-xs text-muted-foreground flex items-center justify-between border-t">
                        <span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                Enter
                            </kbd>{" "}
                            para buscar
                        </span>
                        <span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                Esc
                            </kbd>{" "}
                            para cerrar
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
