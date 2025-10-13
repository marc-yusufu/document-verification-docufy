import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const messages = [
  {
    text: "Experience fast approvals — no waiting!",
    video: "/Videos/N1T6oR5L1j23XHT6yP.mp4",
  },
  {
    text: "Enjoy secure digital verification — no protection worries.",
    video: "/Videos/0x2w5K5fsqM9M0sxfH.mp4",
  },
  {
    text: "Upload and verify your documents with ease.",
    video: "/Videos/fHU18X9F1M03sZYj9j.mp4",
  },
  {
    text: "Get back to what matters — we’ll handle the rest.",
    video: "/Videos/2Z3C83shgDo2ceJu9r.mp4",
  },
];

const Features = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % messages.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="services"
      className="bg-white py-20 px-6 md:px-16 flex flex-col-reverse md:flex-row items-center gap-10 relative overflow-hidden"
    >
      {/* Left Side - Text + Button */}
      <div className="md:flex-1 text-center md:text-left space-y-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-snug bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 bg-clip-text text-transparent"
          >
            {messages[index].text}
          </motion.h2>
        </AnimatePresence>

        <p className="text-gray-600 text-lg">
          Quick, reliable, and secure document verification — anytime, anywhere.
        </p>

        <Link to="/signup">
          <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
            Get Started
          </button>
        </Link>
      </div>

      {/* Right Side - Video + Vertical Indicator */}
      <div className="md:flex-1 flex justify-center relative">
        <AnimatePresence mode="wait">
          <motion.video
            key={messages[index].video}
            src={messages[index].video}
            autoPlay
            loop
            muted
            playsInline
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-72 md:w-[26rem] rounded-3xl shadow-lg border border-blue-100"
          />
        </AnimatePresence>

        {/* Vertical Indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pr-2">
          {messages.map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full border-2 ${i === index
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent scale-125"
                  : "bg-white border-blue-400"
                }`}
              animate={{
                scale: i === index ? 1.25 : 1,
                opacity: i === index ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />
    </section>
  );
};

export default Features;
