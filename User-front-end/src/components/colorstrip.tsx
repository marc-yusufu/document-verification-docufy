const ColorStrip = () => {
    return (
        <div className="w-full h-[10px] relative overflow-hidden">
            <div className="flex w-full h-full">
                <div className="flex-1 bg-[#000000] transform -skew-x-12 origin-top-left"></div>
                <div className="flex-1 bg-[#1D4A94] transform -skew-x-12 origin-top-left"></div>
                <div className="flex-1 bg-[#387F59] transform -skew-x-12 origin-top-left"></div>
                <div className="flex-1 bg-[#CC473B] transform -skew-x-12 origin-top-left"></div>
                <div className="flex-1 bg-[#F2BF48] transform -skew-x-12 origin-top-left"></div>
            </div>
        </div>
    );
};

export default ColorStrip;