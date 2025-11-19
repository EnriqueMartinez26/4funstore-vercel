"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { platforms, genres } from "@/lib/data";
import { Loader2, Upload } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    platformId: "",
    genreId: "",
    type: "Digital",
    developer: "",
    imageUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ApiClient.createProduct(formData, token || undefined);
      toast({ title: "Producto creado", description: "El producto se ha publicado exitosamente." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el producto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader><CardTitle className="text-2xl">Publicar Nuevo Producto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nombre del Juego</Label>
              <Input name="name" required value={formData.name} onChange={handleChange} placeholder="Ej: Super Mario Odyssey" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" required value={formData.description} onChange={handleChange} placeholder="Detalles del juego..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio ($)</Label>
                <Input name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input name="stock" type="number" required value={formData.stock} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select onValueChange={(val) => handleSelectChange("platformId", val)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{platforms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select onValueChange={(val) => handleSelectChange("genreId", val)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{genres.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de la Imagen</Label>
              <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Publicar Producto</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}