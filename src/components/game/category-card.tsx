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
      <div className="relative w-full h-48 sm:h-56 md:h-60 overflow-hidden rounded-xl bg-transparent flex items-center justify-center">

        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />


      </div>
    </Link>
  );
}