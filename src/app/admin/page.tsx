"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeProducts: number;
    lowStockProducts: number;
    monthlyGrowth: number;
}

interface ChartItem {
    date: string;
    total: number;
    orders: number;
}

interface TopProduct {
    _id: string;
    name: string;
    totalSold: number;
    revenueGenerated: number;
}

export default function AdminDashboardPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartItem[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, chartRes, topRes] = await Promise.all([
                    ApiClient.getDashboardStats(),
                    ApiClient.getSalesChart(),
                    ApiClient.getTopProducts()
                ]);

                setStats(statsData);
                // Formateamos fechas para el gráfico (ej: "2024-02-17" -> "17 Feb")
                setChartData(chartRes.map((item: any) => ({
                    ...item,
                    displayDate: new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                })));
                setTopProducts(topRes);
            } catch (error) {
                console.error("Dashboard Error:", error);
                toast({
                    title: "Error cargando dashboard",
                    description: "No se pudieron obtener las estadísticas recientes.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando métricas...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <p className="text-muted-foreground">Resumen de actividad de la tienda en tiempo real.</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stats?.monthlyGrowth && stats.monthlyGrowth > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : null}
                            <span className={stats?.monthlyGrowth && stats.monthlyGrowth > 0 ? "text-green-500" : ""}>
                                {stats?.monthlyGrowth || 0}%
                            </span>
                            {" "}vs mes anterior
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">En toda la plataforma</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">Catálogo visible</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Bajo / Crítico</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${stats?.lowStockProducts ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats?.lowStockProducts ? 'text-destructive' : ''}`}>
                            {stats?.lowStockProducts || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Productos con {"<"} 5 unidades</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* SALES CHART */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Ventas (Últimos 30 días)</CardTitle>
                        <CardDescription>
                            Ingresos diarios reportados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), "Ventas"]}
                                            labelStyle={{ color: '#333' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No hay ventas registradas en los últimos 30 días.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* TOP PRODUCTS */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>🔥 Productos Más Vendidos</CardTitle>
                        <CardDescription>
                            Top 5 productos por unidades vendidas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {topProducts.length > 0 ? (
                                topProducts.map((product) => (
                                    <div key={product._id} className="flex items-center">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-sm font-medium leading-none truncate pr-4" title={product.name}>
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.totalSold} unidades vendidas
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm">
                                            {formatCurrency(product.revenueGenerated)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Aún no hay datos de productos vendidos.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
