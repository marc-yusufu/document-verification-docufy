import SplitText from "../components/splitText";
import RotatingText from "./rotatingText";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[86vh] flex flex-col justify-center items-center text-center text-white mt-20 px-4 py-20 overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center grayscale brightness-85"
        style={{ backgroundImage: "url('../../public/BG.jpg')" }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>

      {/* Content */}

      <div className="relative z-10 max-w-2xlg space-y-6" data-aos="fade-up">

        {/* Hero Title */}
        <SplitText
          text="Get your documents verified"
          splitType="chars"
          delay={80}
          duration={0.7}
          textAlign="center"
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
        />

        {/* Rotating Text Section */}
        <div className="flex justify-center items-center gap-2">
          <p className="text-2xl font-medium">It's</p>
          <RotatingText
            texts={["Quick", "Simple", "eDocufy"]}
            mainClassName="px-3 bg-white text-blue-600 overflow-hidden py-1 justify-center rounded-lg"
            elementLevelClassName="text-2xl sm:text-3xl font-bold"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>

        {/* Description */}
        <p className="text-lg text-white/70">
          From upload to approval in minutes — experience the efficiency of our
          smart document verification system.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            const el = document.getElementById("services");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-6 bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-blue-100 transition"
        >
          Get Started
        </button>
      </div>

      {/* Scroll Indicator (Bottom Center) */}
      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce opacity-70"
        onClick={() => {
          const el = document.getElementById("services");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <img
          src="/IconPac/angle-down.png"
          alt="Scroll down"
          className="w-6 h-6 md:w-8 md:h-8"
        />
      </div>
    </section>
  );
};

export default Hero;
