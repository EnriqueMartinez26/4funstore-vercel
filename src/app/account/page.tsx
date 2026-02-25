"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ApiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Key,
  Package,
  Calendar,
  Camera,
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface DigitalKey {
  _id: string;
  productoId: string;
  clave: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  orderItems: any[];
  digitalKeys?: DigitalKey[];
}

export default function AccountPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile editing
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Initialize edit fields when user loads
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      ApiClient.getUserOrders()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data as any)?.orders || [];
          setOrders(list as Order[]);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Solo se permiten archivos de imagen.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "La imagen no puede superar los 5 MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const imageUrl = await ApiClient.uploadImage(file);
      await ApiClient.updateProfile({ avatar: imageUrl });
      await refreshUser();
      toast({ title: "Avatar actualizado", description: "Tu foto de perfil se ha cambiado correctamente." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo subir la imagen.", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await ApiClient.updateProfile({ avatar: null });
      await refreshUser();
      toast({ title: "Avatar eliminado", description: "Se ha removido tu foto de perfil." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }

    setSavingProfile(true);
    try {
      await ApiClient.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });
      await refreshUser();
      toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Error", description: "Completá ambos campos de contraseña.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La nueva contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await ApiClient.changePassword({ currentPassword, newPassword });
      toast({ title: "Contraseña actualizada", description: res.message || "Tu contraseña se ha cambiado correctamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo cambiar la contraseña.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || "U").substring(0, 2).toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long" })
    : "—";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Header con Avatar grande */}
      <header className="mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold font-headline">¡Hola, {user.name}!</h1>
          <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start mt-1">
            <Mail className="h-4 w-4" /> {user.email}
          </p>
          <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {user.role === "admin" ? "Administrador" : "Usuario"}
            </Badge>
            {user.isVerified ? (
              <Badge variant="outline" className="border-green-500 text-green-500 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verificado
              </Badge>
            ) : (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500 gap-1">
                <XCircle className="h-3 w-3" /> Sin verificar
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Miembro desde {memberSince}</p>
        </div>
      </header>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        {/* ======== PEDIDOS ======== */}
        <TabsContent value="orders" className="space-y-4">
          {loadingOrders ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aún no has comprado nada.</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                  <Link href="/productos">Ir a la tienda</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order._id} className="overflow-hidden border-l-4 border-l-primary/50">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Orden #{order._id.slice(-6)}
                        <Badge variant={order.isPaid ? "default" : "secondary"}>
                          {order.isPaid ? "Pagado" : "Pendiente"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.totalPrice)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {Array.isArray(order.orderItems) && order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <span className="font-medium">{item.name} <span className="text-xs text-muted-foreground">x{item.quantity}</span></span>

                        {order.isPaid && Array.isArray(order.digitalKeys) && (
                          <div className="flex flex-col items-end gap-1">
                            {order.digitalKeys
                              .filter((k) => k.productoId === item.product || k.productoId === item.product?._id)
                              .map((k, kIdx) => (
                                <div key={kIdx} className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-md text-xs font-mono border border-green-500/20">
                                  <Key className="h-3 w-3" />
                                  {k.clave}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ======== AJUSTES ======== */}
        <TabsContent value="settings" className="space-y-6">

          {/* --- Foto de Perfil --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" /> Foto de Perfil
              </CardTitle>
              <CardDescription>
                Subí una imagen para personalizar tu cuenta. Se verá en tu perfil y en la comunidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-muted">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 h-4 w-4" />
                      )}
                      {user.avatar ? "Cambiar foto" : "Subir foto"}
                    </Button>
                    {user.avatar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5 MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- Información Personal --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" /> Información Personal
              </CardTitle>
              <CardDescription>
                Actualizá tu nombre e información de contacto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="flex items-center gap-2">
                  Email
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">No editable</Badge>
                </Label>
                <Input
                  id="edit-email"
                  value={user.email}
                  disabled
                  className="opacity-60"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-phone" className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Teléfono
                </Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+54 11 1234-5678"
                  type="tel"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-address" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Dirección
                </Label>
                <Input
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Tu dirección (opcional)"
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* --- Cambiar Contraseña --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualizá tu contraseña para mantener tu cuenta segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetí la nueva contraseña"
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* --- Info de la Cuenta --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Rol</span>
                  <span className="font-medium capitalize">{user.role === "admin" ? "Administrador" : "Usuario"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Estado del email</span>
                  <span className="font-medium flex items-center gap-1">
                    {user.isVerified ? (
                      <><CheckCircle2 className="h-4 w-4 text-green-500" /> Verificado</>
                    ) : (
                      <><XCircle className="h-4 w-4 text-yellow-500" /> Pendiente de verificación</>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span className="font-medium">{memberSince}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Pedidos realizados</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}