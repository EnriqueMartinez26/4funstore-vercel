"use client";

import React, { useState, useEffect } from 'react';
import { GameCard } from './game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Game } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

interface GameCatalogProps {
  initialGames: Game[];
}

export function GameCatalog({ initialGames }: GameCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  // Estado para los filtros de Backend
  const [games, setGames] = useState<Game[]>(initialGames || []);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(false);

  // Estado para filtros Frontend (Precio)
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Estado para las listas de filtros (Dinámico)
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  // Estado para la paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // UseRef para evitar el fetch inicial (ya tenemos data del servidor)
  const isFirstRender = React.useRef(!initialSearch);

  // Cargar filtros dinámicos al montar
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [pData, gData] = await Promise.all([
          ApiClient.getPlatforms(),
          ApiClient.getGenres()
        ]);
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
      } catch (e) {
        console.error("Error loading filters:", e);
      }
    };
    loadFilters();
  }, []);

  // Filtrado Frontend de Precios
  const displayedGames = games.filter(game => {
    const price = game.price;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return price >= min && price <= max;
  });

  // Efecto principal: Recargar productos cuando cambia CUALQUIER filtro de BACKEND
  useEffect(() => {
    const fetchFilteredGames = async () => {
      setLoading(true);
      try {
        const response = await ApiClient.getProducts({
          page,
          limit: 8,
          search: searchQuery,
          platform: selectedPlatform,
          genre: selectedGenre
        });

        if (Array.isArray(response)) {
          setGames(response as any as Game[]);
        } else {
          setGames(response.products as any as Game[]);
          setTotalPages(response.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce solo para la búsqueda de texto para no saturar la API
    const timeoutId = setTimeout(() => {
      // Evitar fetch inicial redundante SOLO si no vino búsqueda en URL
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      fetchFilteredGames();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, page, selectedPlatform, selectedGenre]);

  // Resetear paginación si cambian los filtros principales
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPlatform, selectedGenre]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedGenre('all');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    router.push('/productos'); // Limpiar URL
  };

  return (
    <section className="py-12 md:py-16">
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">Explorar Colección</h2>
        </div>

        {/* Fila Superior: Búsqueda, Precio y Reset */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-6 rounded-lg border border-border/50">
          {/* Búsqueda */}
          <div className="w-full md:flex-1">
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background w-full"
            />
          </div>

          {/* Filtro de Precio (Frontend) */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-background w-[100px]"
              min={0}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-background w-[100px]"
              min={0}
            />
          </div>

          {/* Botón Limpiar */}
          <Button onClick={resetFilters} variant="outline" className="border-dashed whitespace-nowrap">
            <ListFilter className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>

        {/* Fila Inferior: Filtros de Categoría */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="bg-background w-full sm:w-[250px]">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Plataformas</SelectItem>
              {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="bg-background w-full sm:w-[250px]">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Géneros</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : displayedGames.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-muted/20 rounded-lg border-2 border-dashed">
          <h3 className="font-headline text-2xl font-bold">No se encontraron juegos</h3>
          <p className="text-muted-foreground mt-2">Prueba seleccionando "Todas" o "Todos" para ver el catálogo completo.</p>
          <Button onClick={resetFilters} variant="link" className="mt-4 text-primary">
            Limpiar filtros
          </Button>
        </div>
      )}
    </section>
  );
}
