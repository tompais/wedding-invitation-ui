import Hero from "./components/Hero/Hero";
import Intro from "./components/Intro/Intro";
import EventInfo from "./components/EventInfo/EventInfo";
import Gallery from "./components/Gallery/Gallery";
import RSVP from "./components/RSVP/RSVP";
import InfoCards from "./components/InfoCards/InfoCards";
import Footer from "./components/Footer/Footer";
import Album from "./components/Album/Album";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import SeparatorFloral from "./components/SeparatorFloral/SeparatorFloral";

function App() {
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
    </>
  );
}

export default App;
