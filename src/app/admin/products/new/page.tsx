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
  const [formData, setFormData] = useState({ name: "", description: "", price: "", stock: "", platformId: "", genreId: "", type: "Digital", developer: "", imageUrl: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ApiClient.createProduct(formData, token || undefined);
      toast({ title: "Éxito", description: "Producto publicado." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Falló la creación." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader><CardTitle>Publicar Nuevo Producto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2"><Label>Nombre</Label><Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio</Label><Input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
              <div className="space-y-2"><Label>Stock</Label><Input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Plataforma</Label><Select onValueChange={(v) => setFormData({...formData, platformId: v})}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Género</Label><Select onValueChange={(v) => setFormData({...formData, genreId: v})}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>URL Imagen</Label><Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} /></div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : "Publicar"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}