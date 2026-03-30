"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClient } from "@/lib/api";
import type { Game } from "@/lib/types";

export function useGameCatalog(initialGames: Game[], initialTotalPages = 1) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialPlatform = searchParams.get("platform");
    const initialGenre = searchParams.get("genre");

    const [games, setGames] = useState<Game[]>(initialGames || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
        initialPlatform ? initialPlatform.split(",").filter(Boolean) : []
    );
    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        initialGenre ? initialGenre.split(",").filter(Boolean) : []
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

    const [platforms, setPlatforms] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [pData, gData] = await Promise.all([
                    ApiClient.getPlatforms(),
                    ApiClient.getGenres()
                ]);
                setPlatforms(Array.isArray(pData) ? pData : pData?.data || []);
                setGenres(Array.isArray(gData) ? gData : gData?.data || []);
            } catch (e) {
                console.error("Error loading filters:", e);
            }
        };
        loadFilters();
    }, []);

    useEffect(() => {
        const fetchFilteredGames = async () => {
            setLoading(true);
            try {
                const platformParam = selectedPlatforms.length > 0 ? selectedPlatforms.join(",") : undefined;
                const genreParam = selectedGenres.length > 0 ? selectedGenres.join(",") : undefined;

                const response = await ApiClient.getProducts({
                    page,
                    limit: 12,
                    search: searchQuery,
                    platform: platformParam,
                    genre: genreParam,
                    sort: "order",
                    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
                });

                if (Array.isArray(response)) {
                    setGames(response as any as Game[]);
                } else {
                    setGames(
                        Array.isArray(response.products)
                            ? (response.products as any as Game[])
                            : []
                    );
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
    }, [searchQuery, page, selectedPlatforms, selectedGenres, priceRange]);

    useEffect(() => {
        if (isFirstRender.current) return;
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedPlatforms.length > 0) params.set("platform", selectedPlatforms.join(","));
        if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));

        const query = params.toString();
        router.push(query ? `/productos?${query}` : "/productos", { scroll: false });
    }, [searchQuery, selectedPlatforms, selectedGenres, router]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedPlatforms, selectedGenres]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedPlatforms([]);
        setSelectedGenres([]);
        setPriceRange([0, 500]);
        setPage(1);
    };

    return {
        games,
        loading,
        page,
        setPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        selectedPlatforms,
        setSelectedPlatforms,
        selectedGenres,
        setSelectedGenres,
        priceRange,
        setPriceRange,
        platforms,
        genres,
        resetFilters,
    };
}
