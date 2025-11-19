"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const { token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadProducts();
  }, [authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      await ApiClient.deleteProduct(id, token || undefined);
      toast({ title: "Producto eliminado", description: "El producto ha sido borrado correctamente." });
      loadProducts(); // Recargar lista
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el producto." });
    }
  };

  if (loading || authLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Nuevo Producto</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventario ({products.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                      <Image 
                        src={product.imageId.startsWith('http') ? product.imageId : '/placeholder.png'} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/products/${product.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}