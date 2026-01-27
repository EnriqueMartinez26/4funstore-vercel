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

const DEVELOPERS = [
  'Nintendo', 'Sony Interactive Entertainment', 'Xbox Game Studios', 'Tencent Games', 'Ubisoft', 'Electronic Arts (EA)', 'Take-Two Interactive', 'Activision Blizzard', 'Capcom', 'Bandai Namco Entertainment'
] as const;

const SPEC_PRESETS = ['Low', 'Mid', 'High'] as const;

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe ser más detallada"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  platformId: z.string().min(1, "Selecciona una plataforma"),
  genreId: z.string().min(1, "Selecciona un género"),
  type: z.enum(["Digital", "Physical"]),
  developer: z.enum(DEVELOPERS, {
    errorMap: () => ({ message: "Selecciona un desarrollador válido" })
  }),
  specPreset: z.enum(SPEC_PRESETS, {
    errorMap: () => ({ message: "Selecciona un preset de requisitos" })
  }),
  imageUrl: z.string().url("Debes subir una imagen válida"),
  trailerUrl: z.string().optional(),
  // Discount Fields
  isDiscounted: z.boolean().default(false),
  originalPrice: z.coerce.number().optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  discountEndDate: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, platformId: "", genreId: "", type: "Digital", developer: "Nintendo", specPreset: "Mid", imageUrl: "", trailerUrl: "",
      isDiscounted: false, originalPrice: 0, discountPercentage: 0, discountEndDate: "",
    },
  });

  useEffect(() => {
    // 1. Fetch auxiliary data
    Promise.all([
      ApiClient.getPlatforms(),
      ApiClient.getGenres()
    ]).then(([pData, gData]) => {
      setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
      setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
    }).catch(console.error);

    // 2. Fetch Product data
    if (id === 'new') return;
    ApiClient.getProductById(id).then(p => {
      if (p) {
        form.reset({
          name: p.name,
          description: p.description,
          stock: p.stock,
          platformId: p.platform.id,
          genreId: p.genre.id,
          type: p.type as "Digital" | "Physical",
          developer: p.developer as any, // Cast to any to avoid error if DB has old value
          specPreset: (p.specPreset || "Mid") as any, // Default to Mid if not present
          imageUrl: p.imageId,
          trailerUrl: p.trailerUrl || "",
          // Discount Fields
          // Si hay precio original, significa que hay descuento.
          // En ese caso, el input "price" del formulario debe mostrar el PRECIO ORIGINAL (para que el usuario lo edite fácil)
          // Si no hay descuento, price muestra el precio real.
          isDiscounted: !!p.originalPrice && p.originalPrice > 0,
          originalPrice: 0, // No usamos este campo en el UI, se calcula en submit
          discountPercentage: p.discountPercentage || 0,
          discountEndDate: p.discountEndDate ? new Date(p.discountEndDate).toISOString().split('T')[0] : "",

          // Override price logic for UI:
          price: (p.originalPrice && p.originalPrice > 0) ? p.originalPrice : p.price
        });
      }
      setLoading(false);
    }).catch(() => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el producto" });
      setLoading(false);
    });
  }, [id, form, toast]);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const url = await ApiClient.uploadImage(file);
      form.setValue("imageUrl", url);
      toast({ title: "Imagen actualizada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al subir imagen" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload: any = { ...data };

      // Lógica de Descuento
      if (data.isDiscounted) {
        // Si hay descuento activado:
        // 1. El valor en el input 'price' se convierte en el Precio Original (base)
        payload.originalPrice = data.price;
        // 2. El precio real de venta se calcula restando el porcentaje
        const discountDec = (data.discountPercentage || 0) / 100;
        payload.price = Number((data.price * (1 - discountDec)).toFixed(2));
      } else {
        // Si NO hay descuento:
        // 1. El valor en el input 'price' es el precio real
        // 2. Limpiamos campos de descuento
        payload.originalPrice = 0; // o null
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
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Producto con descuento</FormLabel>
                  </div>
                </FormItem>
              )} />

              {/* Discount Section (Conditional) */}
              {form.watch('isDiscounted') && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="font-semibold text-lg">💰 Descuento</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* originalPrice Input REMOVED - Using main price input as base */}
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
                  <p className="text-xs text-muted-foreground">Si el Precio Original es mayor a 0, el producto se mostrará con descuento.</p>
                </div>
              )}

              {/* Plataforma, Género y Desarrollador */}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar empresa" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {DEVELOPERS.map((dev) => (<SelectItem key={dev} value={dev}>{dev}</SelectItem>))}
                    </SelectContent>
                  </Select>
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
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* KEY MANAGER SECTION (Only for Digital Products and Existing Products) */}
      {
        id !== 'new' && form.watch('type') === 'Digital' && (
          <KeyManager productId={id} productName={form.getValues('name')} />
        )
      }
    </div >
  );
}