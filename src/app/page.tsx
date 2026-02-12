"use client";

import { useEffect } from "react";
import Hero from "../components/Hero/Hero";
import Intro from "../components/Intro/Intro";
import EventInfo from "../components/EventInfo/EventInfo";
import Gallery from "../components/Gallery/Gallery";
import RSVP from "../components/RSVP/RSVP";
import InfoCards from "../components/InfoCards/InfoCards";
import Footer from "../components/Footer/Footer";
import Album from "../components/Album/Album";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import SeparatorFloral from "../components/SeparatorFloral/SeparatorFloral";
import MusicPlayer from "../components/MusicPlayer/MusicPlayer";

export default function Home() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
