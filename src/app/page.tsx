import { FondoSimbolos } from "@/components/landing/FondoSimbolos";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { QueRecibes } from "@/components/landing/QueRecibes";
import { ArcoSemanal } from "@/components/landing/ArcoSemanal";
import { Prohibiciones } from "@/components/landing/Prohibiciones";
import { Cierre } from "@/components/landing/Cierre";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <FondoSimbolos />
      {/* El contenido se apila por encima del fondo con `relative z-10`. Sin
          eso, la capa fija se pintaría sobre las secciones, que son
          transparentes. */}
      <Header />
      <main className="relative z-10 flex-1">
        <Hero />
        <ComoFunciona />
        <QueRecibes />
        <ArcoSemanal />
        <Prohibiciones />
        <Cierre />
      </main>
      <Footer />
    </>
  );
}
