"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { MoreHorizontal, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
};

const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
        case 'delivered': return <Badge className="bg-green-500 hover:bg-green-600">Entregado</Badge>;
        case 'processing': return <Badge className="bg-blue-500 hover:bg-blue-600">Procesando</Badge>;
        case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>;
        case 'shipped': return <Badge className="bg-purple-500 hover:bg-purple-600">Enviado</Badge>;
        case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiClient.getAllOrders({
                page,
                limit: 15,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            setOrders(res.orders);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({ title: "Error", description: "No se pudieron cargar las órdenes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await ApiClient.updateOrderStatus(orderId, newStatus);
            toast({ title: "Estado actualizado", description: `Orden actualizada a "${STATUS_LABELS[newStatus] || newStatus}".` });
            fetchOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
        }
    };

    // Derive display name from order — backend populates user with { name, email }
    const getCustomerName = (order: any): string => {
        if (order.user?.name) return order.user.name;
        if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
        return "Cliente";
    };

    const getCustomerEmail = (order: any): string => {
        return order.user?.email || "";
    };

    // Client-side search filter (on already-fetched page)
    const filteredOrders = searchTerm
        ? orders.filter(o => {
            const term = searchTerm.toLowerCase();
            return (
                o._id?.toLowerCase().includes(term) ||
                getCustomerName(o).toLowerCase().includes(term) ||
                getCustomerEmail(o).toLowerCase().includes(term)
            );
        })
        : orders;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Órdenes</h1>
                <p className="text-muted-foreground">Revisa y actualiza el estado de los pedidos.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por ID o cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Órdenes</CardTitle>
                    <CardDescription>Total: {total} órdenes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron órdenes.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Orden</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Pago</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-mono text-xs">{order._id?.slice(-8).toUpperCase()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{getCustomerName(order)}</span>
                                                <span className="text-xs text-muted-foreground">{getCustomerEmail(order)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.orderStatus || order.status || 'pending')}</TableCell>
                                        <TableCell>
                                            {order.isPaid ?
                                                <Badge variant="outline" className="text-green-600 border-green-600">Pagado</Badge>
                                                : <Badge variant="outline" className="text-red-500 border-red-500">Sin pagar</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString('es-AR')}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(order.totalPrice || order.total || 0)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(order._id, 'processing')}>
                                                        Procesando
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(order._id, 'shipped')}>
                                                        Enviado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(order._id, 'delivered')}>
                                                        Entregado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleStatusChange(order._id, 'cancelled')}
                                                    >
                                                        Cancelar Orden
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
