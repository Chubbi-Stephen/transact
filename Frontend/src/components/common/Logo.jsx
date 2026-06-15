import React from 'react';

const Logo = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "h-8 w-8 text-lg",
        md: "h-12 w-12 text-2xl",
        lg: "h-20 w-20 text-4xl"
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div 
                className={`${sizeClasses[size] || sizeClasses.md} bg-[#E4570A] flex items-center justify-center shadow-lg shadow-orange-500/20 animate-blob`}
                style={{
                    borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%",
                    transition: "all 0.5s ease-in-out"
                }}
            >
                <span className="font-black text-white select-none">T</span>
            </div>
        </div>
    );
};

export default Logo;
