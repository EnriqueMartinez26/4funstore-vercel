export type Platform = {
  id: string;
  name: string;
};

export type Genre = {
  id: string;
  name: string;
};

export type Game = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  plataforma: Platform;
  genero: Genre;
  tipo: 'Digital' | 'Fisico';
  fechaLanzamiento: string;
  desarrollador: string;
  imagenUrl: string;
  calificacion: number;
  stock?: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'ADMIN';
  telefono?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
  };
  activo: boolean;
};

export type CarritoItem = {
  id: string;
  producto: Game;
  cantidad: number;
  precioUnitario?: number;
  fechaAgregado?: string;
};

export type Pedido = {
  id: string;
  numeroPedido: string;
  usuario: Usuario;
  items: PedidoItem[];
  subtotal: number;
  impuestos: number;
  costoEnvio: number;
  total: number;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  metodoPago: 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'PAYPAL' | 'TRANSFERENCIA';
  direccionEnvio: {
    nombreCompleto: string;
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
    telefono: string;
  };
  fechaCreacion: string;
  fechaActualizacion?: string;
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
  notasCliente?: string;
};

export type PedidoItem = {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};
