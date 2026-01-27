"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface FilterOption {
    id: string;
    name: string;
}

interface CatalogSidebarProps {
    platforms: FilterOption[];
    genres: FilterOption[];
    selectedPlatforms: string[];
    setSelectedPlatforms: (ids: string[]) => void;
    selectedGenres: string[];
    setSelectedGenres: (ids: string[]) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    onClear: () => void;
    className?: string;
}

export function CatalogSidebar({
    platforms,
    genres,
    selectedPlatforms,
    setSelectedPlatforms,
    selectedGenres,
    setSelectedGenres,
    priceRange,
    setPriceRange,
    onClear,
    className,
}: CatalogSidebarProps) {

    const handlePlatformChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedPlatforms([...selectedPlatforms, id]);
        } else {
            setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
        }
    };

    const handleGenreChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedGenres([...selectedGenres, id]);
        } else {
            setSelectedGenres(selectedGenres.filter((g) => g !== id));
        }
    };

    return (
        <div className={className}>
            <div className="flex items-center justify-between py-4">
                <h3 className="font-headline text-lg font-semibold">Filtros</h3>
                <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    <X className="mr-1 h-3 w-3" />
                    Limpiar
                </Button>
            </div>
            <Separator />

            <Accordion type="multiple" defaultValue={["price", "platform", "genre"]} className="w-full">
                {/* Precio */}
                <AccordionItem value="price">
                    <AccordionTrigger>Precio</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-1 py-4 space-y-4">
                            <Slider
                                defaultValue={[0, 1000]}
                                value={priceRange}
                                min={0}
                                max={10000000} // Aumentado para soportar precios altos
                                step={1000} // Pasos de 1000
                                onValueChange={(val) => setPriceRange(val as [number, number])}
                            />
                            <div className="flex items-center justify-between text-sm">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="platform">
                    <AccordionTrigger>Plataformas</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {platforms.map((platform) => (
                                <div key={platform.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`p-${platform.id}`}
                                        checked={selectedPlatforms.includes(platform.id)}
                                        onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`p-${platform.id}`} className="text-sm font-normal cursor-pointer">
                                        {platform.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="genre">
                    <AccordionTrigger>Géneros</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {genres.map((genre) => (
                                <div key={genre.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`g-${genre.id}`}
                                        checked={selectedGenres.includes(genre.id)}
                                        onCheckedChange={(checked) => handleGenreChange(genre.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`g-${genre.id}`} className="text-sm font-normal cursor-pointer">
                                        {genre.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
