"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Key, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyManagerProps {
    productId: string;
    productName: string;
}

export function KeyManager({ productId, productName }: KeyManagerProps) {
    const { toast } = useToast();
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputKeys, setInputKeys] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const loadKeys = async () => {
        setLoading(true);
        try {
            const res = await ApiClient.getKeysByProduct(productId);
            if (res.success) {
                setKeys(res.data);
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las keys" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId && productId !== 'new') {
            loadKeys();
        }
    }, [productId]);

    const handleSave = async () => {
        if (!inputKeys.trim()) return;

        // Split por nuevas líneas o comas y limpiar espacios
        const keysArray = inputKeys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

        if (keysArray.length === 0) return;

        setIsSaving(true);
        try {
            const res = await ApiClient.addKeys(productId, keysArray);
            if (res.success) {
                toast({
                    title: "Keys Agregadas",
                    description: `Se agregaron ${res.addedCount} keys nuevas. (${res.ignoredCount} duplicadas)`
                });
                setInputKeys("");
                loadKeys(); // Recargar tabla
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Falló la carga de keys" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, keyVal: string) => {
        if (!confirm(`¿Seguro que querés borrar la key: ${keyVal}?`)) return;

        try {
            await ApiClient.deleteKey(id);
            toast({ title: "Key eliminada" });
            setKeys(keys.filter(k => k._id !== id));
        } catch (error) {
            toast({ variant: "destructive", title: "Error al borrar" });
        }
    };

    return (
        <Card className="mt-8 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Gestón de Licencias Digitales (Keys)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Input Area */}
                <div className="space-y-4 rounded-lg bg-muted/50 p-4 border">
                    <h4 className="text-sm font-medium">Agregar Keys (Una por línea)</h4>
                    <Textarea
                        placeholder="AAAA-BBBB-CCCC-DDDD&#10;EEEE-FFFF-GGGG-HHHH"
                        className="font-mono text-sm min-h-[120px]"
                        value={inputKeys}
                        onChange={(e) => setInputKeys(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving || !inputKeys.trim()}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Cargar al Inventario
                        </Button>
                    </div>
                </div>

                {/* List Area */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Clave</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : keys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No hay keys cargadas para este producto
                                    </TableCell>
                                </TableRow>
                            ) : (
                                keys.map((k) => (
                                    <TableRow key={k._id}>
                                        <TableCell className="font-mono text-xs md:text-sm">{k.clave}</TableCell>
                                        <TableCell>
                                            <Badge variant={k.estado === 'DISPONIBLE' ? 'default' : k.estado === 'VENDIDA' ? 'destructive' : 'secondary'}>
                                                {k.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(k._id, k.clave)} disabled={k.estado === 'VENDIDA'}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
