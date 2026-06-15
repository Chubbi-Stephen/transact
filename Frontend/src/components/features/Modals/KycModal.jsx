import { useState, useEffect } from "react";

import Modal from "./Modal";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import { Shield, ShieldCheck, BadgeCheck, ArrowRight, Smartphone, Fingerprint, FileText, CheckCircle2, AlertCircle, ChevronRight, Upload, Camera, Scan, UserCheck, Loader2 } from "lucide-react";


const KycModal = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1); // 1: Select, 2: Form, 3: Face Scan, 4: Success
    const [loading, setLoading] = useState(false);
    const [isValidatingBvn, setIsValidatingBvn] = useState(false);
    const [resolvedName, setResolvedName] = useState("");
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [formData, setFormData] = useState({
        bvn: "",
        documentType: "NIN",
        documentNumber: ""
    });
    const [files, setFiles] = useState({
        idDocument: null,
        utilityBill: null
    });

    useEffect(() => {
        if (formData.bvn.length === 11) {
            setIsValidatingBvn(true);
            setTimeout(() => {
                if (formData.bvn.startsWith("000")) {
                    toast.error("BVN not found. Please check and try again.");
                    setResolvedName("");
                } else {
                    setResolvedName("ADEBAYO OLUWASEUN CHUKWUMA");
                }
                setIsValidatingBvn(false);
            }, 1500);
        } else {
            setResolvedName("");
        }
    }, [formData.bvn]);


    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (selectedLevel === 3) {
            setStep(3); // Go to Face Scan for Tier 3
            return;
        }

        processVerification();
    };

    const processVerification = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            data.append("level", selectedLevel);
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (files.idDocument) data.append("idDocument", files.idDocument);
            if (files.utilityBill) data.append("utilityBill", files.utilityBill);

            const endpoint = selectedLevel === 3 ? "http://localhost:5000/api/auth/upgrade-kyc-full" : "http://localhost:5000/api/auth/upgrade-kyc";

            await axios.post(endpoint, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            await refreshUser();
            setStep(4);
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFaceScan = () => {
        setLoading(true);
        // Simulate OPay Liveness detection
        setTimeout(() => {
            processVerification();
        }, 3000);
    };

    const TIER_DATA = [
        { level: 1, label: "Tier 1", limit: "50,000", req: "Phone Number", active: user?.kycLevel >= 1 },
        { level: 2, label: "Tier 2", limit: "200,000", req: "BVN Verification", active: user?.kycLevel >= 2 },
        { level: 3, label: "Tier 3", limit: "5,000,000", req: "Identity Document", active: user?.kycLevel >= 3 },
    ];

    if (step === 4) {
        return (
            <Modal onClose={onClose}>
                <div className="p-10 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Verified!</h3>
                    <p className="text-sm font-medium text-slate-400 mb-10">
                        Your account has been upgraded to Tier {selectedLevel}. Enjoy higher transaction limits.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em]"
                    >
                        Great, Thanks!
                    </button>
                </div>
            </Modal>
        );
    }

    if (step === 3) {
        return (
            <Modal title="Face Verification" onClose={onClose}>
                <div className="p-10 text-center flex flex-col items-center">
                    <div className="relative mb-12">
                        <div className="w-56 h-56 border-4 border-[#E4570A] rounded-full flex items-center justify-center relative overflow-hidden bg-slate-50 shadow-inner shadow-slate-200">
                            {loading ? (
                                <div className="absolute inset-0 bg-slate-900/10 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                                    <div className="w-48 h-1 bg-[#E4570A]/20 relative overflow-hidden rounded-full">
                                        <div className="absolute inset-0 bg-[#E4570A] animate-scan-y"></div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Scanning Liveness...</p>
                                </div>
                            ) : (
                                <Camera size={64} className="text-slate-200" />
                            )}
                            <div className="absolute inset-0 border-[12px] border-white rounded-full pointer-events-none"></div>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-2">
                            <Scan size={14} className="text-[#E4570A]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Front Camera</span>
                        </div>
                    </div>

                    <h4 className="font-black text-slate-900 text-xl mb-4">Liveness Detection</h4>
                    <p className="text-sm font-medium text-slate-400 max-w-[280px] mb-12">
                        Position your face within the circle and blink your eyes when the scanner moves.
                    </p>

                    <button
                        onClick={handleFaceScan}
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-50"
                    >
                        {loading ? "Capturing..." : "Start Face Scan"}
                    </button>
                </div>
            </Modal>
        );
    }


    return (
        <Modal title="Account Verification" onClose={onClose}>
            <div className="p-6">
                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#E4570A] shadow-sm">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm">Boost your Limits</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upgrade to access more features</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {TIER_DATA.map((tier) => (
                                <button
                                    key={tier.level}
                                    disabled={tier.active || (tier.level > (user?.kycLevel + 1))}
                                    onClick={() => {setSelectedLevel(tier.level); setStep(2);}}
                                    className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] border-2 transition-all ${
                                        tier.active 
                                        ? "bg-slate-50 border-transparent opacity-60" 
                                        : (tier.level === user?.kycLevel + 1)
                                        ? "bg-white border-slate-100 hover:border-[#E4570A] hover:bg-orange-50/30"
                                        : "bg-slate-50 border-transparent opacity-30 cursor-not-allowed"
                                    }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.active ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                            {tier.level === 3 ? <BadgeCheck size={20} /> : <ShieldCheck size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-slate-900 text-sm">{tier.label}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit: ₦{tier.limit}</p>
                                        </div>
                                    </div>
                                    {tier.active ? (
                                        <span className="text-[8px] font-black uppercase text-green-500 bg-green-50 px-2 py-1 rounded-full">Active</span>
                                    ) : (
                                        <ChevronRight size={18} className="text-slate-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {selectedLevel === 2 ? (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                        <Fingerprint size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-900">Link your BVN</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Bank Verification Number</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 relative">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">BVN Number (11 Digits)</label>
                                    <input 
                                        type="tel" 
                                        maxLength={11}
                                        required
                                        className="bg-transparent w-full font-black text-xl tracking-[0.2em] outline-none text-slate-900"
                                        placeholder="22233344455"
                                        value={formData.bvn}
                                        onChange={(e) => setFormData({ ...formData, bvn: e.target.value.replace(/\D/g, '') })}
                                    />
                                    {isValidatingBvn && <div className="absolute right-6 bottom-6"><Loader2 size={16} className="animate-spin text-[#E4570A]" /></div>}
                                </div>

                                {resolvedName && (
                                    <div className="animate-in slide-in-from-top-2 p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between border border-white/10">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-white/10 p-2 rounded-lg"><UserCheck size={14} className="text-green-400" /></div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[200px]">{resolvedName}</span>
                                        </div>
                                        <div className="bg-green-500 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-blue-600/70 leading-relaxed">
                                        Linking your BVN doesn't give us access to your bank accounts. It only confirms your identity with the central database.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-900">Upload ID Document</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full Identity Verification</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {['NIN', 'Passport', 'License', 'Voter Card'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, documentType: type })}
                                            className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.documentType === type ? 'border-[#E4570A] bg-orange-50 text-[#E4570A]' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Document Number</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="bg-transparent w-full font-black text-xl tracking-widest outline-none text-slate-900"
                                        placeholder="ID NUMBER"
                                        value={formData.documentNumber}
                                        onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload ID (Front)</label>
                                        <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-slate-200 border-dashed rounded-[1.5rem] appearance-none cursor-pointer hover:border-[#E4570A] focus:outline-none">
                                            <span className="flex items-center space-x-2">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500">{files.idDocument ? files.idDocument.name : "Select Image"}</span>
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles({ ...files, idDocument: e.target.files[0] })} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Utility Bill (Proof of Address)</label>
                                        <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-slate-200 border-dashed rounded-[1.5rem] appearance-none cursor-pointer hover:border-[#E4570A] focus:outline-none">
                                            <span className="flex items-center space-x-2">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500">{files.utilityBill ? files.utilityBill.name : "Select Image"}</span>
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles({ ...files, utilityBill: e.target.files[0] })} />
                                        </label>
                                    </div>
                                </div>

                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-full font-black text-[11px] uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading || (selectedLevel === 2 && !resolvedName) || (selectedLevel === 3 && !formData.documentNumber)}
                                className="flex-[2] py-5 bg-[#E4570A] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-500/20 disabled:opacity-30 disabled:grayscale transition-all"
                            >
                                {loading ? "Verifying..." : `Upgrade to ${TIER_DATA[selectedLevel - 1].label}`}
                            </button>

                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default KycModal;
