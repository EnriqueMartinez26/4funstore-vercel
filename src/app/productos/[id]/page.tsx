import type { Metadata } from 'next';
import { ApiClient } from '@/lib/api';
import { ProductDetailView } from '@/components/game/product-detail-view';
import { notFound } from 'next/navigation';
import { Game } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const game = await ApiClient.getProductById(id) as unknown as Game;
        return {
            title: `${game.name} | 4Fun`,
            description: game.description ? game.description.substring(0, 160) : `Compra ${game.name} al mejor precio en 4Fun Store.`,
            openGraph: {
                title: game.name,
                description: game.description || undefined,
                images: game.imageId ? [game.imageId] : undefined,
            }
        };
    } catch (error) {
        return { title: 'Producto no encontrado | 4Fun' };
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const game = await ApiClient.getProductById(id) as unknown as Game;
        if (!game) notFound(); // Will trigger src/app/not-found.tsx (to be created)
        return <ProductDetailView game={game} />;
    } catch (error) {
        console.error("Error fetching product on server:", error);
        notFound(); // Treating fetch error as 404 for simplicity/robustness in front
    }
}
