"use client";

import { useEffect } from "react";
import Album from "../components/Album/Album";
import EventInfo from "../components/EventInfo/EventInfo";
import Footer from "../components/Footer/Footer";
import Gallery from "../components/Gallery/Gallery";
import Hero from "../components/Hero/Hero";
import InfoCards from "../components/InfoCards/InfoCards";
import Intro from "../components/Intro/Intro";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import MusicPlayer from "../components/MusicPlayer/MusicPlayer";
import RSVP from "../components/RSVP/RSVP";
import SeparatorFloral from "../components/SeparatorFloral/SeparatorFloral";

export default function Home() {
  useEffect(() => {
    if ("scrollRestoration" in globalThis.history) {
      globalThis.history.scrollRestoration = "manual";
    }
    globalThis.scrollTo({ top: 0, left: 0, behavior: "auto" });
    globalThis.requestAnimationFrame(() => {
      globalThis.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  return (
    <>
      <LoadingScreen />
      <Hero />
      <SeparatorFloral />
      <Intro />
      <SeparatorFloral />
      <EventInfo />
      <SeparatorFloral />
      <Gallery />
      <SeparatorFloral />
      <RSVP />
      <SeparatorFloral />
      <InfoCards />
      <SeparatorFloral />
      <Album />
      <SeparatorFloral />
      <Footer />
      <MusicPlayer />
    </>
  );
}
