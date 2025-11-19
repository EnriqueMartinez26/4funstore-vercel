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
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (id === 'new') return;
    ApiClient.getProductById(id).then(p => {
       if(p) setFormData({ name: p.name, description: p.description, price: p.price, stock: p.stock, platformId: p.platform.id, genreId: p.genre.id, type: p.type, imageUrl: p.imageId });
       setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.updateProduct(id, formData, token || undefined);
      toast({ title: "Éxito", description: "Actualizado." });
      router.push("/admin/products");
    } catch { toast({ variant: "destructive", title: "Error" }); }
  };

  if (id === 'new') return null;
  if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Button variant="ghost" asChild><Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>
      <Card>
        <CardHeader><CardTitle>Editar</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2"><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
              <div className="space-y-2"><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Guardar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}