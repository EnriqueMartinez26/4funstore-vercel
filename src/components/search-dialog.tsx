"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const router = useRouter();

    // Handle Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const isControlled = controlledOpen !== undefined;
    const showOpen = isControlled ? controlledOpen : open;
    const setShowOpen = isControlled ? onOpenChange! : setOpen;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setShowOpen(false);
            router.push(`/productos?search=${encodeURIComponent(query)}`);
        }
    };

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
                                placeholder="Escribe para buscar productos..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </form>
                    </DialogHeader>

                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {query.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Busca juegos, géneros o plataformas...
                            </div>
                        ) : (
                            <div className="grid gap-1">
                                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Resultados sugeridos</p>
                                <Button
                                    variant="ghost"
                                    className="justify-start h-9 px-2 text-sm font-normal"
                                    onClick={handleSearch}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar &quot;{query}&quot;
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="py-2 px-4 bg-muted/50 text-xs text-muted-foreground text-right border-t">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">Esc</span>
                        </kbd> para cerrar
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
