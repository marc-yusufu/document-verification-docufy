const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] bg-gradient-to-br from-blue-400 to-blue-600 text-white px-4 md:px-16 py-16 flex flex-col md:flex-row justify-between items-center gap-10"
    >
      <div className="max-w-xl" data-aos="fade-right">
        <h2 className="text-5xl md:text-6xl font-bold">Get your documents verified</h2>
        <p className="text-lg mt-2">Quick and Simple</p>
        <p className="text-sm mt-4 text-blue-100">
          From upload to approval in minutes—experience the efficiency of our smart document verification system.
        </p>
        <button
          onClick={() => {
            const el = document.getElementById('services');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="mt-6 bg-white text-blue-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-blue-100 transition"
        >
          Get Started
        </button>
      </div>

      <div data-aos="fade-left">
        <img
          src="/src/assets/19962851_6203999-Photoroom.png"
          alt="Document Illustration"
          className="w-72 md:w-96"
        />
      </div>

      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce opacity-40"
        onClick={() => {
          const el = document.getElementById('services');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <img
          src="/public/IconPac/angle-down.png"
          alt="Scroll down"
          className="w-6 h-6 md:w-8 md:h-8"
        />
      </div>
    </section>
  );
};

export default Hero;
