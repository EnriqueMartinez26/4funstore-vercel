"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GameCard } from './game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { Game } from '@/lib/types';
import { CatalogSidebar } from './catalog-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGameCatalog } from '@/hooks/use-game-catalog';

interface GameCatalogProps {
  initialGames: Game[];
  initialTotalPages?: number;
}

export function GameCatalog({ initialGames, initialTotalPages = 1 }: GameCatalogProps) {
  const {
    games, loading, page, setPage, totalPages,
    searchQuery, setSearchQuery, selectedPlatforms,
    setSelectedPlatforms, selectedGenres, setSelectedGenres,
    priceRange, setPriceRange, platforms, genres, resetFilters
  } = useGameCatalog(initialGames, initialTotalPages);

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
            ) : games.length > 0 ? (
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
                  {games.map((game) => (
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
