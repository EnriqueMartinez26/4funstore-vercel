"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import Image from "next/image";

// Importaciones para formularios y validación
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const DEVELOPERS = [
  'Nintendo', 'Sony Interactive Entertainment', 'Xbox Game Studios', 'Tencent Games', 'Ubisoft', 'Electronic Arts (EA)', 'Take-Two Interactive', 'Activision Blizzard', 'Capcom', 'Bandai Namco Entertainment'
] as const;

const SPEC_PRESETS = ['Low', 'Mid', 'High'] as const;

// Esquema de Validación
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
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  useAuth(); // Verifica autenticación de admin
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      ApiClient.getPlatforms(),
      ApiClient.getGenres()
    ]).then(([pData, gData]) => {
      setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
      setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
    }).catch(console.error);
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      platformId: "",
      genreId: "",
      type: "Digital",
      developer: "Nintendo",
      specPreset: "Mid",
      imageUrl: "",
    },
  });

  // Función de subida a Cloudinary centralizada
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const url = await ApiClient.uploadImage(file);
      form.setValue("imageUrl", url);
      toast({ title: "Imagen subida correctamente" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: "Error al subir imagen" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await ApiClient.createProduct(data);
      toast({ title: "Éxito", description: "Producto publicado correctamente." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("400")) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "Verifica que el desarrollador sea válido"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: msg || "No se pudo crear el producto."
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Publicar Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej: God of War" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Detalles..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="platformId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>{platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="genreId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Nivel de requisitos" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormItem>
                <FormLabel>Imagen de Portada</FormLabel>
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
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Publicar Producto"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}