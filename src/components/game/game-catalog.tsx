"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from './game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { Game } from '@/lib/types';
import { ApiClient } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { CatalogSidebar } from './catalog-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface GameCatalogProps {
  initialGames: Game[];
  initialTotalPages?: number;
}

export function GameCatalog({ initialGames, initialTotalPages = 1 }: GameCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialPlatform = searchParams.get('platform');
  const initialGenre = searchParams.get('genre');

  // Data State
  const [games, setGames] = useState<Game[]>(initialGames || []);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [page, setPage] = useState(1);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialPlatform ? initialPlatform.split(',').filter(Boolean) : []
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialGenre ? initialGenre.split(',').filter(Boolean) : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // Dynamic Options
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  const isFirstRender = useRef(true);

  // Load Filter Options
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

  // Filter Logic (Frontend for Price, Backend for others)
  const displayedGames = games.filter(game => {
    const price = game.price;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // Fetch Logic
  useEffect(() => {
    const fetchFilteredGames = async () => {
      setLoading(true);
      try {
        // Convert array filters to API format (comma separated or 'all')
        // Ideally backend receives ?platform=id1,id2
        const platformParam = selectedPlatforms.length > 0 ? selectedPlatforms.join(',') : undefined;
        const genreParam = selectedGenres.length > 0 ? selectedGenres.join(',') : undefined;

        const response = await ApiClient.getProducts({
          page,
          limit: 12, // Increased limit for grid
          search: searchQuery,
          platform: platformParam,
          genre: genreParam,
          sort: 'order'
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

    const timeoutId = setTimeout(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      fetchFilteredGames();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, page, selectedPlatforms, selectedGenres]); // Price filtered on client for smooth slider

  // Sync State to URL
  useEffect(() => {
    // Skip the very first render to avoid redundant push if server already handled it
    if (isFirstRender.current) return;

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedPlatforms.length > 0) params.set('platform', selectedPlatforms.join(','));
    if (selectedGenres.length > 0) params.set('genre', selectedGenres.join(','));

    const query = params.toString();
    const newPath = query ? `/productos?${query}` : '/productos';

    // We use push with { scroll: false } to maintain position
    router.push(newPath, { scroll: false });
  }, [searchQuery, selectedPlatforms, selectedGenres, router]);

  // Reset Page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPlatforms, selectedGenres]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setPriceRange([0, 500]);
    setPage(1);
    // router.push already handled by the sync useEffect
  };

  return (
    <section className="py-8 md:py-12">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-headline text-3xl font-bold md:text-4xl">Explorar Colección</h2>
          <p className="text-muted-foreground mt-2">Encuentra tu próxima aventura entre nuestros juegos.</p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Mobile Filter Sheet */}
          <div className="lg:hidden w-full flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <CatalogSidebar
                    platforms={platforms}
                    genres={genres}
                    selectedPlatforms={selectedPlatforms}
                    setSelectedPlatforms={setSelectedPlatforms}
                    selectedGenres={selectedGenres}
                    setSelectedGenres={setSelectedGenres}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    onClear={resetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-24">
            <div className="mb-6">
              <Input
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </div>
            <CatalogSidebar
              platforms={platforms}
              genres={genres}
              selectedPlatforms={selectedPlatforms}
              setSelectedPlatforms={setSelectedPlatforms}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClear={resetFilters}
              className="border p-4 rounded-lg bg-card"
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-h-[500px]">
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Cargando...</p>
              </div>
            ) : displayedGames.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {displayedGames.map((game) => (
                    <motion.div
                      key={game.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                      }}
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-12 border-t pt-8">
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
                <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros de búsqueda.</p>
                <Button onClick={resetFilters} variant="link" className="mt-4 text-primary">
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
