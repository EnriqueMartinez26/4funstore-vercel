"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const mockOrders: Order[] = [
    {
        id: "ORD-001",
        userId: "user1",
        total: 239.98,
        status: 'delivered',
        createdAt: "2024-03-10T14:30:00Z",
        paymentMethod: "Credit Card",
        shippingAddress: { fullName: "Juan Perez", street: "Av. Siempre Viva 123", city: "Springfield", zip: "12345", country: "Argentina" },
        items: [
            { id: "1", productId: "p1", name: "Elden Ring", price: 59.99, quantity: 1 },
            { id: "2", productId: "p2", name: "God of War", price: 49.99, quantity: 1 }
        ]
    },
    {
        id: "ORD-002",
        userId: "user2",
        total: 59.99,
        status: 'processing',
        createdAt: "2024-03-12T09:15:00Z",
        paymentMethod: "PayPal",
        shippingAddress: { fullName: "Maria Garcia", street: "Calle Falsa 123", city: "Buenos Aires", zip: "1400", country: "Argentina" },
        items: [
            { id: "3", productId: "p3", name: "Cyberpunk 2077", price: 59.99, quantity: 1 }
        ]
    },
    {
        id: "ORD-003",
        userId: "user3",
        total: 129.50,
        status: 'pending',
        createdAt: "2024-03-13T11:20:00Z",
        paymentMethod: "Credit Card",
        shippingAddress: { fullName: "Carlos Lopez", street: "Rivadavia 450", city: "Cordoba", zip: "5000", country: "Argentina" },
        items: [
            { id: "4", productId: "p4", name: "Hollow Knight", price: 15.00, quantity: 2 },
            { id: "5", productId: "p5", name: "FIFA 24", price: 70.00, quantity: 1 }
        ]
    },
];

const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case 'delivered': return <Badge className="bg-green-500 hover:bg-green-600">Entregado</Badge>;
        case 'processing': return <Badge className="bg-blue-500 hover:bg-blue-600">Procesando</Badge>;
        case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>;
        case 'shipped': return <Badge className="bg-purple-500 hover:bg-purple-600">Enviado</Badge>;
        case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOrders = mockOrders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.shippingAddress.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Órdenes</h1>
                <p className="text-muted-foreground">Revisa y actualiza el estado de los pedidos.</p>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por ID o Cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Órdenes Recientes</CardTitle>
                    <CardDescription>Total: {mockOrders.length} órdenes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Orden</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{order.shippingAddress.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{order.items.length} items</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Marcar Enviado</DropdownMenuItem>
                                                <DropdownMenuItem>Marcar Entregado</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Cancelar Orden</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
