import { useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ImpactCounterProps {
    value: number;
    label: string;
    subtext?: string;
    unit?: string;
    decimals?: number;
    className?: string;
}

export default function ImpactCounter({
    value,
    label,
    subtext,
    unit = "",
    decimals = 0,
    className
}: ImpactCounterProps) {
    const ref = useRef<HTMLDivElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30, // Smooth stop
        stiffness: 100, // Speed
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    // Hook to render the animated value as text
    const AnimatedNumber = ({ value: v }: { value: any }) => {
        const formatted = v.get().toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        // Framer motion values update too fast for React render cycle if we just use them in JSX
        // So we use a manual subscription for pure DOM updates if needed, 
        // but for simple cases, we can use a state update listener or a ref.
        // However, the simplest framer-motion pattern for text is using a Motion Component's children prop logic or `useTransform`.

        // Actually, simpler approach for text animation with framer-motion:
        // We render a span and update its textContent in a useEffect.
        const textRef = useRef<HTMLSpanElement>(null);

        useEffect(() => {
            const unsubscribe = v.on("change", (latest: number) => {
                if (textRef.current) {
                    textRef.current.textContent = latest.toLocaleString(undefined, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    });
                }
            });
            return unsubscribe;
        }, [v]);

        return <span ref={textRef}>0</span>;
    };

    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-green-100",
                className
            )}
        >
            <div className="flex items-baseline gap-1 text-4xl md:text-5xl font-extrabold text-green-700">
                <AnimatedNumber value={springValue} />
                {unit && <span className="text-2xl md:text-3xl text-green-600/80 font-bold ml-1">{unit}</span>}
            </div>
            <h3 className="mt-2 text-lg font-bold text-green-900 text-center uppercase tracking-wider">{label}</h3>
            {subtext && <p className="text-sm text-green-700/70 text-center mt-1 font-medium">{subtext}</p>}
        </div>
    );
}
