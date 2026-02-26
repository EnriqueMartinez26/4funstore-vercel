import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  className?: string;
}

export function CategoryCard({
  title,
  image,
  href,
  className,
}: CategoryCardProps) {
  const imageUrl =
    image && (image.startsWith("http") || image.startsWith("/"))
      ? image
      : "https://placehold.co/600x400/png?text=Categoria";

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-xl",
        className
      )}
    >
      <div className="relative w-full h-48 sm:h-56 md:h-60 overflow-hidden rounded-xl bg-muted flex items-center justify-center">

        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

        <div className="absolute bottom-0 left-0 p-5 w-full">
          <h3 className="text-xl md:text-2xl font-bold text-white font-headline tracking-tight transition-transform duration-300 group-hover:translate-x-1">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}