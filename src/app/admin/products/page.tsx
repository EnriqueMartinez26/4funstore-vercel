"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { VisualsManager } from "@/components/admin/visuals-manager";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/schemas"; // Import strict Product type
import type { Meta } from "@/lib/types"; // Import strict Meta type
export default function AdminProductsPage() {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await ApiClient.getProducts({ page, limit: 10, sort: '-createdAt' });
      // Response is strictly typed as PaginatedResponse now. No guessing using Array.isArray needed.
      setProducts(response.products);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los productos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadProducts(1);
  }, [authLoading]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      loadProducts(newPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      // CORRECCIÓN: Eliminamos el segundo argumento 'token'
      await ApiClient.deleteProduct(id);
      toast({ title: "Producto eliminado", description: "El producto ha sido borrado correctamente (eliminación lógica)." });
      loadProducts(meta.page);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el producto." });
    }
  };

  if (loading || authLoading) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      <TableSkeleton rows={10} columns={5} />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Inventario</p>
            <Button asChild>
              <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Nuevo Producto</Link>
            </Button>
          </div>
        </CardHeader>
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
                        src={(product.imageId && (product.imageId.startsWith('http') || product.imageId.startsWith('/'))) ? product.imageId : 'https://placehold.co/600x400/png?text=4Fun'}
                        alt={product.name}
                        fill
                        sizes="48px"
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

          {/* Controles de Paginación */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {meta.page} de {meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </CardContent>
      </Card>

    </div >
  );
}