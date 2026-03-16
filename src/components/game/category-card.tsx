import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    title: string;
    image: string;
    href: string;
    className?: string;
}

export function CategoryCard({ title, image, href, className }: CategoryCardProps) {
    return (
        <Link 
            href={href} 
            // Agregamos max-w-[160px] para limitar el tamaño y mx-auto para centrarla
            className={cn("group relative block overflow-hidden rounded-2xl w-full max-w-[160px] mx-auto", className)}
        >
            {/* aspect-square unifica todas las tarjetas en cuadrados perfectos */}
            <div className="relative w-full aspect-square">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay oscuro: completamente invisible, aparece de golpe suave al hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Texto: entra desde abajo (translate-y) al hacer hover para darle un toque premium */}
                <div className="absolute inset-0 flex items-center justify-center p-4 opacity-0 translate-y-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white text-center drop-shadow-xl">
                        {title}
                    </h3>
                </div>
            </div>
        </Link>
    );
}