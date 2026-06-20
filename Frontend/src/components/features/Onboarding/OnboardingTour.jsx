import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Briefcase, Zap, ShieldCheck, Wallet, PieChart } from 'lucide-react';

const OnboardingTour = () => {
    const [step, setStep] = useState(-1); // -1 is the initial welcome modal
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        if (!hasCompletedOnboarding) {
            setIsVisible(true);
        }
    }, []);

    // Scroll target into view
    useEffect(() => {
        if (step >= 0 && step < steps.length) {
            const el = document.getElementById(steps[step].target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('tour-highlight');
                return () => el.classList.remove('tour-highlight');
            }
        }
    }, [step]);

    const completeOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setIsVisible(false);
    };

    const steps = [
        {
            title: "Your Wealth Hub",
            description: "This is your main dashboard. Monitor your Wallet balance and T-Vault savings in real-time.",
            icon: <Wallet className="text-[#E4570A]" />,
            target: "dashboard-stats"
        },
        {
            title: "Financial IQ (T-Co)",
            description: "Meet T-Co, your AI mentor. Chat anytime for budget advice, insights, or quick transactions.",
            icon: <Briefcase className="text-[#013653]" />,
            target: "ai-trigger"
        },
        {
            title: "Quick Actions",
            description: "Fund your wallet, transfer to banks, or buy airtime instantly from the quick menu.",
            icon: <Zap className="text-yellow-500" />,
            target: "quick-actions-bar"
        },
        {
            title: "SafeLock Protection",
            description: "Lock funds away for specific goals and earn the highest interest rates in the market.",
            icon: <ShieldCheck className="text-green-500" />,
            target: "safelock-section"
        }
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-none">
            <AnimatePresence>
                {/* Initial Welcome Modal */}
                {step === -1 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 flex items-center justify-center p-6 pointer-events-auto bg-[#013653]/60 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
                            <div className="h-32 bg-[#013653] flex items-center justify-center relative">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                <div className="w-16 h-16 bg-[#E4570A] rounded-2xl flex items-center justify-center relative z-10 border-4 border-white/10 shadow-xl">
                                    <Zap size={32} className="text-white" />
                                </div>
                            </div>
                            <div className="p-8 text-center">
                                <h2 className="text-xl font-black text-[#013653] uppercase tracking-widest mb-2">Welcome to Transact</h2>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">
                                    Your journey to financial dominance starts here. Let's take a 30-second tour of your new command center.
                                </p>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setStep(0)}
                                        className="w-full bg-[#013653] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#014a72] transition-all"
                                    >
                                        Start Tour
                                    </button>
                                    <button 
                                        onClick={completeOnboarding}
                                        className="w-full text-slate-400 py-2 text-[9px] font-black uppercase tracking-widest hover:text-[#013653]"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step Content */}
                {step >= 0 && step < steps.length && (
                    <div className="fixed inset-0 pointer-events-auto bg-black/20">
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute bottom-10 left-6 right-6 md:left-auto md:right-10 md:w-80"
                        >
                            <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-[#013653]/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12"></div>
                                
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                        {steps[step].icon}
                                    </div>
                                    <div className="flex space-x-1">
                                        {steps.map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-4 bg-[#E4570A]' : 'w-1 bg-slate-200'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-sm font-black text-[#013653] uppercase tracking-widest mb-2 relative z-10">
                                    {steps[step].title}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed mb-6 relative z-10">
                                    {steps[step].description}
                                </p>

                                <div className="flex items-center justify-between relative z-10">
                                    <button 
                                        onClick={completeOnboarding}
                                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500"
                                    >
                                        Skip
                                    </button>
                                    <button 
                                        onClick={() => step === steps.length - 1 ? completeOnboarding() : setStep(step + 1)}
                                        className="bg-[#013653] text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center space-x-2"
                                    >
                                        <span>{step === steps.length - 1 ? "Finish" : "Next"}</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OnboardingTour;
