import { useState, useMemo } from 'react';
import type { Game } from '@/lib/types';

interface UseGameFilterProps {
  games: Game[];
  itemsPerPage?: number;
}

export function useGameFilter({ games, itemsPerPage = 8 }: UseGameFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 70]);
  const [currentPage, setCurrentPage] = useState(1);

  // Lógica de filtrado memorizada
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || game.platform.id === selectedPlatform;
      const matchesGenre = selectedGenre === 'all' || game.genre.id === selectedGenre;
      const matchesPrice = game.price >= priceRange[0] && game.price <= priceRange[1];
      return matchesSearch && matchesPlatform && matchesGenre && matchesPrice;
    });
  }, [games, searchQuery, selectedPlatform, selectedGenre, priceRange]);

  // Lógica de paginación
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGames.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGames, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedGenre('all');
    setPriceRange([0, 70]);
    setCurrentPage(1);
  };

  // Resetear página cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedGenre, priceRange]);

  return {
    searchQuery, setSearchQuery,
    selectedPlatform, setSelectedPlatform,
    selectedGenre, setSelectedGenre,
    priceRange, setPriceRange,
    paginatedGames,
    totalGames: filteredGames.length,
    currentPage,
    totalPages,
    setCurrentPage,
    resetFilters
  };
}