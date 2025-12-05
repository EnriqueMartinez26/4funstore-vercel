"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { platforms, genres } from "@/lib/data";
import { Loader2, Save, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe ser más detallada"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  platformId: z.string().min(1, "Selecciona una plataforma"),
  genreId: z.string().min(1, "Selecciona un género"),
  type: z.enum(["Digital", "Physical"]),
  developer: z.string().min(1, "El desarrollador es requerido"),
  imageUrl: z.string().url("Debes subir una imagen válida"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, platformId: "", genreId: "", type: "Digital", developer: "", imageUrl: "",
    },
  });

  useEffect(() => {
    if (id === 'new') return;
    ApiClient.getProductById(id).then(p => {
       if(p) {
         form.reset({
           name: p.name,
           description: p.description,
           price: p.price,
           stock: p.stock,
           platformId: p.platform.id,
           genreId: p.genre.id,
           type: p.type as "Digital" | "Physical",
           developer: p.developer,
           imageUrl: p.imageId
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "4fun_preset"); 

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dxlbwdqop/image/upload`, 
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Error Cloudinary");
      const data = await res.json();
      if (data.secure_url) {
        form.setValue("imageUrl", data.secure_url);
        toast({ title: "Imagen actualizada" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error al subir imagen" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await ApiClient.updateProduct(id, data); 
      toast({ title: "Éxito", description: "Producto actualizado correctamente." });
      router.push("/admin/products");
      router.refresh();
    } catch (error) { 
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar" }); 
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
                <FormItem><FormLabel>Desarrollador</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
    </div>
  );
}