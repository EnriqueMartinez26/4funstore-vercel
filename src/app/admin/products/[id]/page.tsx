"use client";

import { useEffect, useState, use } from "react";
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
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", stock: "", platformId: "", genreId: "", type: "Digital", developer: "", imageUrl: "",
  });

  useEffect(() => {
    if (id === 'new') return; // EVITA EL ERROR DE CASTING

    const fetchProduct = async () => {
      try {
        const product = await ApiClient.getProductById(id);
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            platformId: typeof product.platform === 'object' ? product.platform.id : product.platform,
            genreId: typeof product.genre === 'object' ? product.genre.id : product.genre,
            type: product.type,
            developer: product.developer,
            imageUrl: product.imageId,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ApiClient.updateProduct(id, formData, token || undefined);
      toast({ title: "Éxito", description: "Producto actualizado." });
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && id !== 'new') return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (id === 'new') return null; // No renderizar nada si por error carga esta ruta

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Button variant="ghost" asChild><Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>
      <Card>
        <CardHeader><CardTitle>Editar Producto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2"><Label>Nombre</Label><Input name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea name="description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio ($)</Label><Input name="price" type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
              <div className="space-y-2"><Label>Stock</Label><Input name="stock" type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>URL Imagen</Label><Input name="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} /></div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}