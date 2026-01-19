"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, Trash2, Plus } from "lucide-react";
import type { Platform, Genre } from "@/lib/types";

// Utility types for our manager
type VisualType = 'platform' | 'genre';
type VisualItem = Platform | Genre;

export function VisualsManager() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<VisualType>("platform");
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pData, gData] = await Promise.all([
                ApiClient.getPlatforms(),
                ApiClient.getGenres()
            ]);

            // Normalización: Asegurar arrays
            setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
            setGenres(Array.isArray(gData) ? gData : (gData?.data || []));

        } catch (error) {
            console.error("Error fetching visuals:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = () => {
        fetchData();
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const getItems = () => {
        switch (activeTab) {
            case 'platform': return platforms;
            case 'genre': return genres;
            default: return [];
        }
    };

    const getLabel = () => {
        switch (activeTab) {
            case 'platform': return "Nueva Plataforma";
            case 'genre': return "Nuevo Género";
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VisualType)} className="w-full">
            <Card className="mt-8 border-t-4 border-t-primary/20">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-headline">Gestión de Visuales</CardTitle>
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="platform">Plataformas</TabsTrigger>
                            <TabsTrigger value="genre">Géneros</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Administra Plataformas y Géneros centralizadamente.</p>
                        <CreateDialog type={activeTab} onUpdate={handleUpdate} label={getLabel()} />
                    </div>
                </CardHeader>
                <CardContent>
                    <TabsContent value="platform" className="space-y-4">
                        <VisualTable items={platforms} type="platform" onUpdate={handleUpdate} />
                    </TabsContent>

                    <TabsContent value="genre" className="space-y-4">
                        <VisualTable items={genres} type="genre" onUpdate={handleUpdate} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}

function VisualTable({ items, type, onUpdate }: { items: VisualItem[], type: VisualType, onUpdate: () => void }) {
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Reset selection when type changes or items reload
    useEffect(() => {
        setSelectedIds(new Set());
    }, [type, items]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(items.map(i => i.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const handleDelete = async (ids: string[]) => {
        if (!confirm(`¿Estás seguro de eliminar ${ids.length} elemento(s)?`)) return;

        try {
            if (type === 'platform') {
                if (ids.length === 1) await ApiClient.deletePlatform(ids[0]);
                else await ApiClient.deletePlatformsBulk(ids);
            } else if (type === 'genre') {
                if (ids.length === 1) await ApiClient.deleteGenre(ids[0]);
                else await ApiClient.deleteGenresBulk(ids);
            }
            toast({ title: "Eliminado correctamente" });
            onUpdate();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo eliminar." });
        }
    };

    return (
        <div className="space-y-4">
            {selectedIds.size > 0 && (
                <div className="bg-muted/40 p-2 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium ml-2">{selectedIds.size} seleccionados</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(Array.from(selectedIds))}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Selección
                    </Button>
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={items.length > 0 && selectedIds.size === items.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[100px]">Imagen</TableHead>
                            <TableHead>Nombre (ID)</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={(c) => handleSelect(item.id, !!c)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="relative h-12 w-20 rounded overflow-hidden bg-muted/50">
                                        <Image
                                            src={(item.imageId && (item.imageId.startsWith('http') || item.imageId.startsWith('/'))) ? item.imageId : "https://placehold.co/200x120/png?text=No+Img"}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.id}</div>
                                </TableCell>
                                <TableCell className="flex gap-2 justify-end">
                                    <EditDialog itemId={item.id} type={type} onUpdate={onUpdate} />
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete([item.id])}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No se encontraron elementos.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function CreateDialog({ type, onUpdate, label }: { type: VisualType, onUpdate: () => void, label: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setId("");
            setName("");
            setImageUrl("");
        }
    }, [open]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "4fun_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/dxlbwdqop/image/upload`, { method: "POST", body: formData });
            if (!res.ok) throw new Error("Error Cloudinary");
            const data = await res.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
                toast({ title: "Imagen subida" });
            }
        } catch {
            toast({ variant: "destructive", title: "Error al subir imagen" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!id || !name) {
            toast({ variant: "destructive", title: "Faltan datos", description: "ID y Nombre son obligatorios" });
            return;
        }

        setLoading(true);
        // Sólo auto-formatear si el usuario no escribió un ID explícito (aunque aquí es manual, pero buena práctica)
        const finalId = id.trim().replace(/\s+/g, '-').toLowerCase();

        try {
            const payload = { id: finalId, name, imageId: imageUrl };
            if (type === 'platform') await ApiClient.createPlatform(payload);
            else if (type === 'genre') await ApiClient.createGenre(payload);

            toast({ title: "Creado exitosamente" });
            setOpen(false);
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el elemento." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> {label}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{label}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-id" className="text-right">ID</Label>
                        <Input id="new-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Ej: accion-rpg" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-name" className="text-right">Nombre</Label>
                        <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Acción RPG" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Imagen</Label>
                        <div className="col-span-3 space-y-2">
                            <div className="relative h-20 w-full rounded border bg-muted/50 flex items-center justify-center overflow-hidden">
                                {imageUrl ? <Image src={imageUrl} alt="Preview" fill className="object-cover" /> : <span className="text-xs">Sin imagen</span>}
                            </div>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={loading || isUploading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditDialog({ itemId, type, onUpdate }: { itemId: string, type: VisualType, onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Fetch details on open
    useEffect(() => {
        if (open && itemId) {
            setFetching(true);
            const loadDetails = async () => {
                try {
                    let data;
                    if (type === 'platform') data = await ApiClient.getPlatformById(itemId);
                    else if (type === 'genre') data = await ApiClient.getGenreById(itemId);

                    // Handle possible wrapper structure or direct response
                    const item = data.data || data;

                    setName(item.name || "");
                    setImageUrl(item.imageId || item.image || "");
                } catch (error) {
                    console.error("Error loading details:", error);
                    toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los detalles." });
                    setOpen(false);
                } finally {
                    setFetching(false);
                }
            };
            loadDetails();
        }
    }, [open, itemId, type]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "4fun_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/dxlbwdqop/image/upload`, { method: "POST", body: formData });
            if (!res.ok) throw new Error("Error Cloudinary");
            const data = await res.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
                toast({ title: "Imagen subida" });
            }
        } catch {
            toast({ variant: "destructive", title: "Error al subir imagen" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { name, imageId: imageUrl };
            if (type === 'platform') await ApiClient.updatePlatform(itemId, payload);
            else if (type === 'genre') await ApiClient.updateGenre(itemId, payload);

            toast({ title: "Actualizado correctamente" });
            setOpen(false);
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar {type}</DialogTitle>
                </DialogHeader>
                {fetching ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-muted-foreground">ID</Label>
                            <Input value={itemId} disabled className="col-span-3 bg-muted" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Imagen</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="relative h-32 w-full rounded border bg-muted/50 flex items-center justify-center overflow-hidden">
                                    {imageUrl ? <Image src={imageUrl} alt="Preview" fill className="object-cover" /> : <span className="text-xs">Sin imagen</span>}
                                </div>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading || isUploading || fetching}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
