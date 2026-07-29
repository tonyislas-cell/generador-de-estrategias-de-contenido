import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MARCA } from "@/lib/landing/content";
import { Container } from "./Section";
import { DonationLink } from "./DonationLink";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="font-heading text-xl text-foreground transition-opacity hover:opacity-70"
        >
          {MARCA.nombre}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <DonationLink />
          <Button asChild size="sm">
            <Link href="/cuestionario">Empezar</Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}
