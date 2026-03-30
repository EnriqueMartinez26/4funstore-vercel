import Image from "next/image";
import Link from "next/link";
import { AboutDialog } from "@/components/about-dialog";
import { FaqDialog } from "@/components/faq-dialog";

const footerLinks = {
  "Tienda": [
    { title: "Todos los Juegos", href: "/productos" },
    { title: "Por Plataforma", href: "/productos" },
    { title: "Por Género", href: "/productos" },
  ],
  "Soporte": [
    { title: "Contacto", href: "/contacto" },
    { title: "FAQ", href: "#faq" },
  ],
  "Compañía": [
    { title: "Sobre Nosotros", href: "#about" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 mt-16">
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image src="/logo.png" alt="4Fun Logo" width={110} height={110} className="h-20 w-20 md:h-[110px] md:w-[110px] object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu tienda única para videojuegos digitales y físicos.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-headline font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.title}>
                    {link.href === "#about" ? (
                      <AboutDialog>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer">
                          {link.title}
                        </button>
                      </AboutDialog>
                    ) : link.href === "#faq" ? (
                      <FaqDialog>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer">
                          {link.title}
                        </button>
                      </FaqDialog>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 4Fun Marketplace. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}