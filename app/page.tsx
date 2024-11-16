import Navbar from "@/components/custom/Navbar";
import Footer from "@/components/custom/Footer";
import HeroText from "@/components/custom/HeroText";
import Architecture from "@/components/custom/Architecture";
import Team from "@/components/custom/Team";
import SparklesText from "@/components/ui/sparkles-text";
import Globe from "@/components/ui/globe";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <section id="hero" className="px-4 lg:px-[100px] py-[60px] lg:py-[100px]">
        <div>
          <HeroText />
        </div>
      </section>

      <section id="about" className="relative px-4 lg:px-[100px] py-[60px] lg:py-[100px] text-white">
        <h2 className="text-[20px] lg:text-[40px] font-bold">about us</h2>
        <div className="pt-3">
          <div>
            Traffic and Street data are all <span className="font-bold">OUTDATED</span>. With pepewagon, we are creating a platform that focuses on incentivizing users based on their contributions to street data.
          </div>

          <div className="relative mt-8 h-[300px] lg:h-[400px]">
            {/* Ensure Globe is fully contained within this area */}
            <Globe />
          </div>
        </div>
      </section>

      <section id="how-it-works">

      </section>

      <section id="architecture" className="px-4 lg:px-[100px] py-[60px] lg:py-[100px]">
          <h2 className="text-white text-[20px] lg:text-[40px] font-bold">
            how pepewagon was built
          </h2>
          <div className="lg:flex lg:justify-between">
          <p className="text-white pt-3 lg:text-[20px] lg:w-[525px]">
              we leveraged different blockchain technologies to create a seamless experience for our users.
          </p>
          <div className="w-full">
            <Architecture />
          </div>
          </div>
      </section>

      <section id="why-pepewagon" className="px-4 lg:px-[100px] py-[60px] lg:py-[100px]">
        <h2 className="text-white text-[20px] lg:text-[40px] font-bold">why pepewagon</h2>
      </section>

      <section id="team" className="px-4 lg:px-[100px] py-[60px] lg:py-[100px]">
        <SparklesText text="meet the team" className="text-white text-[20px] lg:text-[40px] font-bold text-center" />
        <div className="pt-10">
          <Team />
        </div>
      </section>
      <Footer />
    </>
  )
}