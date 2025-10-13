const PartnersSection = () => {
    return (
        <section
            id="partners"
            className="w-full bg-gray-50 py-8 px-4 flex flex-col items-center justify-center gap-10 border-t border-gray-200"
        >

            {/* Title */}
            <h2 className="text-gray-700 text-xl md:text-2xl font-semibold ">
                Our Trusted Partners
            </h2>

            {/* Partner Logos */}
            <div className="flex flex-wrap justify-center items-center gap-10 opacity-80">
                <img
                    src="../../public/Pictures/DPSALogo1.webp"
                    alt="Government Logo"
                    className="h-20 w-auto object-contain grayscale-0 hover:grayscale-0 transition duration-300"
                />
                <img
                    src="../../public/Pictures/SAPS_badge.svg.png"
                    alt="Police Logo"
                    className="h-16 w-auto object-contain grayscale-0 hover:grayscale-0 transition duration-300"
                />
                <img
                    src="../../public/Pictures/boxfusionlogo.png"
                    alt="Partner Logo"
                    className="h-12 w-auto object-contain grayscale-0 hover:grayscale-0 transition duration-300"
                />
                <img
                    src="../../public/Pictures/ujLogo.jpg"
                    alt="Partner Logo"
                    className="h-20 w-auto object-contain grayscale-0 hover:grayscale-0 transition duration-300"
                />
            </div>
        </section>
    );
};

export default PartnersSection;
