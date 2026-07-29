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
      <Header />
      <main className="flex-1">
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
