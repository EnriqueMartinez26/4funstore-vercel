"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeyManager } from "@/components/admin/key-manager";
import { adminProductBaseSchema } from "@/lib/schemas";
import { DEVELOPERS, SPEC_PRESETS } from "@/lib/constants";
import { useImageUpload } from "@/hooks/use-image-upload";

// Edit form extends the base schema with optional extra fields
const productSchema = adminProductBaseSchema.extend({
  trailerUrl: z.string().optional(),
  isDiscounted: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  discountEndDate: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [isCustomDev, setIsCustomDev] = useState(false);
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, platformId: "", genreId: "", type: "Digital", developer: "Nintendo", specPreset: "Mid", imageUrl: "", trailerUrl: "",
      isDiscounted: false, discountPercentage: 0, discountEndDate: "",
    },
  });

  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageUrl", url),
    successMessage: "Imagen actualizada",
  });

  useEffect(() => {
    Promise.all([ApiClient.getPlatforms(), ApiClient.getGenres()])
      .then(([pData, gData]) => {
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
      })
      .catch(console.error);

    if (id === 'new') return;
    ApiClient.getProductById(id).then(p => {
      if (p) {
        const devInList = DEVELOPERS.includes(p.developer as any);
        if (!devInList && p.developer) setIsCustomDev(true);

        form.reset({
          name: p.name,
          description: p.description,
          stock: p.stock,
          platformId: p.platform.id,
          genreId: p.genre.id,
          type: p.type as "Digital" | "Physical",
          developer: p.developer,
          specPreset: ((p as any).specPreset || "Mid") as any,
          imageUrl: p.imageId,
          trailerUrl: p.trailerUrl || "",
          isDiscounted: (p.discountPercentage ?? 0) > 0,
          discountPercentage: p.discountPercentage || 0,
          discountEndDate: p.discountEndDate ? new Date(p.discountEndDate).toISOString().split('T')[0] : "",
          price: p.price
        });
      }
      setLoading(false);
    }).catch(() => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el producto" });
      setLoading(false);
    });
  }, [id, form, toast]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload: any = { ...data };
      if (!data.isDiscounted) {
        payload.discountPercentage = 0;
        payload.discountEndDate = "";
      }
      await ApiClient.updateProduct(id, payload);
      toast({ title: "Éxito", description: "Producto actualizado correctamente." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("400")) {
        toast({ variant: "destructive", title: "Error de validación", description: "Verifica los datos ingresados" });
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar" });
      }
    }
  };

  if (id === 'new') return null;
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Button variant="ghost" asChild><Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>
      <Card>
        <CardHeader><CardTitle>Editar Producto</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="isDiscounted" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Producto con descuento</FormLabel>
                  </div>
                </FormItem>
              )} />

              {form.watch('isDiscounted') && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="font-semibold text-lg">💰 Descuento</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento (%)</FormLabel>
                        <FormControl><Input type="number" min="0" max="100" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="discountEndDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Fin Descuento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  {(() => {
                    const pct = form.watch('discountPercentage') || 0;
                    const base = form.watch('price') || 0;
                    if (pct > 0 && base > 0) {
                      const final = (base * (1 - pct / 100)).toFixed(2);
                      return (
                        <p className="text-sm font-medium text-green-400">
                          Precio final: ${final} (ahorro de ${(base - Number(final)).toFixed(2)})
                        </p>
                      );
                    }
                    return null;
                  })()}
                  <p className="text-xs text-muted-foreground">El precio base no se modifica. El descuento se calcula dinámicamente.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="platformId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>{platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="genreId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>{genres.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="developer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Desarrollador</FormLabel>
                  {isCustomDev ? (
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Ej: Behaviour Interactive Inc." value={field.value} onChange={field.onChange} autoFocus />
                      </FormControl>
                      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => { setIsCustomDev(false); field.onChange(DEVELOPERS[0]); }}>Cancelar</Button>
                    </div>
                  ) : (
                    <Select onValueChange={(val) => { if (val === '__custom__') { setIsCustomDev(true); field.onChange(''); } else { field.onChange(val); } }} value={DEVELOPERS.includes(field.value as any) ? field.value : '__show_current__'}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar empresa">{DEVELOPERS.includes(field.value as any) ? field.value : field.value || 'Seleccionar empresa'}</SelectValue></SelectTrigger></FormControl>
                      <SelectContent>
                        {DEVELOPERS.map((dev) => (<SelectItem key={dev} value={dev}>{dev}</SelectItem>))}
                        <SelectItem value="__custom__" className="text-primary font-semibold">+ Añadir otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="specPreset" render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos de PC (Preset)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Nivel de requisitos" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="trailerUrl" render={({ field }) => (
                <FormItem><FormLabel>URL del Trailer (Video)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormItem>
                <FormLabel>Imagen</FormLabel>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  {isUploading && <Loader2 className="animate-spin h-5 w-5" />}
                </div>
                {form.watch("imageUrl") && (
                  <div className="relative mt-2 h-40 w-32 rounded-md overflow-hidden border">
                    <Image src={form.watch("imageUrl")} alt="Preview" fill className="object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => form.setValue("imageUrl", "")}><X className="h-3 w-3" /></Button>
                  </div>
                )}
                <FormMessage />
              </FormItem>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isUploading}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" />Guardar Cambios</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {id !== 'new' && form.watch('type') === 'Digital' && (
        <KeyManager productId={id} productName={form.getValues('name')} />
      )}
    </div>
  );
}
