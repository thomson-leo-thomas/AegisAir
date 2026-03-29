import Image from "next/image";

export default function AppLogo({
    size = 56,
    className = "",
}: {
    size?: number;
    className?: string;
}) {
    return (
        <Image
            src="/aegis-logo.png"
            alt="AegisAir"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            priority
        />
    );
}
