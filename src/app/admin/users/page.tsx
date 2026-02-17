"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Loader2,
    Search,
    MoreVertical,
    Shield,
    User as UserIcon,
    Trash2,
    Filter
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useDebounce } from "@/hooks/use-debounce"; // Eliminado porque usamos lógica manual abajo

// Tipos locales
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Acciones en progreso
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Debounce para búsqueda
    // (Si no existe el hook, lo simulamos con useEffect)
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await ApiClient.getUsers({
                page,
                limit: 10,
                search: debouncedSearch,
                role: roleFilter
            });

            if (res.success) {
                setUsers(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los usuarios.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Recargar cuando cambian filtros
    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch, roleFilter]);

    // Manejo de roles
    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setActionLoading(userId);
        try {
            await ApiClient.updateUser(userId, { role: newRole });
            toast({ title: "Rol actualizado", description: `Usuario ahora es ${newRole}` });
            fetchUsers(); // Refrescar
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Seguro que deseas eliminar este usuario? Esta acción es irreversible.")) return;

        setActionLoading(userId);
        try {
            await ApiClient.deleteUser(userId);
            toast({ title: "Usuario eliminado" });
            fetchUsers();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los accesos y perfiles de la plataforma.</p>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Filtrar por Rol" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Roles</SelectItem>
                        <SelectItem value="admin">Administradores</SelectItem>
                        <SelectItem value="user">Usuarios</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader className="p-0" />
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Registrado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Cargando usuarios...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.role === 'admin' ? (
                                                <Badge variant="default" className="bg-red-500 hover:bg-red-600 gap-1">
                                                    <Shield className="h-3 w-3" /> Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <UserIcon className="h-3 w-3" /> Usuario
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.isVerified ? (
                                                <Badge variant="outline" className="border-green-500 text-green-500">Verificado</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendiente</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString('es-AR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={actionLoading === user._id}>
                                                        {actionLoading === user._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => router.push(`/admin/users/${user._id}`)}>
                                                        Ver Detalle CRM
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(user._id, user.role)}>
                                                        {user.role === 'admin' ? 'Degradar a Usuario' : 'Promover a Admin'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user._id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Paginación simple (Mejorable) */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    Anterior
                </Button>
                <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
