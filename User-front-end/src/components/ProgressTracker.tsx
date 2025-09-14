interface Props {
    status: string;
}

const steps = [
    { key: "Processing", label: "Processing" },
    { key: "Analyzing", label: "Analyzing" },
    { key: "Verified", label: "Verified" },
];

export default function ProgressTracker({ status }: Props) {
    const current = status === "Verified" ? 2 : status === "Pending" ? 1 : 0;

    return (
        <div>
            <div className="flex items-center justify-between">
                {steps.map((s, idx) => {
                    const active = idx <= current;
                    return (
                        <div key={s.key} className="flex-1 flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-500"}`}>
                                <span className="font-semibold">{idx + 1}</span>
                            </div>
                            <div className={`text-xs mt-2 ${active ? "text-blue-600" : "text-gray-400"}`}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* connector lines */}
            <div className="relative mt-2">
                <div className="absolute left-0 right-0 top-4 h-[2px] bg-gray-200"></div>
                <div className="absolute left-[8%] right-[8%] top-4 h-[2px] bg-blue-600" style={{ width: `${(current / (steps.length - 1)) * 100}%` }}></div>
            </div>
        </div>
    );
}
