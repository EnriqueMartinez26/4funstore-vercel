"use client";

import React from 'react';
import { GameCard } from './game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { platforms, genres } from '@/lib/data';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Game } from '@/lib/types';
import { useGameFilter } from '@/hooks/use-game-filter'; // Importamos el hook

interface GameCatalogProps {
  games: Game[];
}

export function GameCatalog({ games }: GameCatalogProps) {
  // Usamos el Custom Hook para toda la lógica
  const {
    searchQuery, setSearchQuery,
    selectedPlatform, setSelectedPlatform,
    selectedGenre, setSelectedGenre,
    priceRange, setPriceRange,
    paginatedGames,
    totalGames,
    currentPage,
    totalPages,
    setCurrentPage,
    resetFilters
  } = useGameFilter({ games, itemsPerPage: 8 });

  return (
    <section className="py-12 md:py-16">
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">Explore Our Collection</h2>
          <span className="text-muted-foreground text-sm">{totalGames} games found</span>
        </div>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-muted/30 p-6 rounded-lg border border-border/50">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2 bg-background"
          />
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium flex justify-between">
              <span>Price Range</span>
              <span className="font-mono text-primary">{formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</span>
            </label>
            <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value)}
                max={70}
                step={1}
                className="py-4"
            />
          </div>
          <Button onClick={resetFilters} variant="outline" className="w-full border-dashed">
            <ListFilter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Grid de Productos */}
      {paginatedGames.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          
          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-muted/20 rounded-lg border-2 border-dashed">
          <h3 className="font-headline text-2xl font-bold">No Games Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters to find your next adventure.</p>
          <Button onClick={resetFilters} variant="link" className="mt-4 text-primary">
            Clear all filters
          </Button>
        </div>
      )}
    </section>
  );
}