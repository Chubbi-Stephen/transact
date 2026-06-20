import { useState, useEffect } from "react";
import {
	User, Mail, Phone, ShieldCheck, Moon, Sun, Bell, BellOff,
	LogOut, ChevronRight, BadgeCheck, ShieldAlert, Lock, KeyRound,
	Smartphone, HelpCircle, FileText, Star, Trash2, Globe, Fingerprint
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import KycModal from "../../components/features/Modals/KycModal";
import EditProfileModal from "../../components/features/Modals/EditProfileModal";
import ChangePasswordModal from "../../components/features/Modals/ChangePasswordModal";
import SetPinModal from "../../components/features/Modals/SetPinModal";
import { authApi } from "../../services/api";
import { getDeviceDetails } from "../../utils/deviceDetection";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { user, logout, refreshUser } = useAuth();
	const { isDark, toggleTheme } = useTheme();
	const { deviceName, location } = getDeviceDetails();
	const [activeModal, setActiveModal] = useState(null); // 'kyc', 'edit', 'password', 'pin'
	const [notifs, setNotifs] = useState({
		push: user?.notifications?.push ?? true,
		email: user?.notifications?.email ?? true,
		sms: user?.notifications?.sms ?? false
	});

	// Sync local notifs state when user object changes
	useEffect(() => {
		if (user?.notifications) {
			setNotifs({
				push: user.notifications.push,
				email: user.notifications.email,
				sms: user.notifications.sms
			});
		}
	}, [user]);

	const handleToggleNotif = async (key) => {
		const newNotifs = { ...notifs, [key]: !notifs[key] };
		setNotifs(newNotifs); // Optimistic update
		try {
			await authApi.updateSettings({ notifications: newNotifs });
			await refreshUser();
			toast.success("Preferences updated");
		} catch (err) {
			setNotifs(notifs); // Revert on failure
			toast.error("Failed to update preferences");
		}
	};

	const handleToggleBiometrics = async () => {
        try {
            if (user?.biometrics?.enabled) {
                await authApi.updateSettings({ "biometrics.enabled": false });
                localStorage.removeItem("biometric_id");
                await refreshUser();
                toast.success("Biometrics disabled");
            } else {
                // Real WebAuthn Registration
                if (!window.PublicKeyCredential) {
                    return toast.error("Biometrics not supported on this browser");
                }

                const challenge = new Uint8Array(32);
                window.crypto.getRandomValues(challenge);

                const createCredentialOptions = {
                    publicKey: {
                        challenge,
                        rp: { name: "Tranxact" },
                        user: {
                            id: new Uint8Array(16), // Simplified for demo
                            name: user.email,
                            displayName: user.firstName || user.username,
                        },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: {
                            authenticatorAttachment: "platform",
                            userVerification: "required",
                        },
                        timeout: 60000,
                    },
                };

                const credential = await navigator.credentials.create(createCredentialOptions);
                
                if (credential) {
                    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                    await authApi.setupBiometrics({ 
                        credentialId: credentialId, 
                        publicKey: "webauthn_enabled" 
                    });
                    localStorage.setItem("biometric_id", credentialId);
                    await refreshUser();
                    toast.success("Biometrics enabled successfully!");
                }
            }
        } catch (err) {
            console.error("WebAuthn Error:", err);
            toast.error("Failed to setup biometrics. Device rejected or timed out.");
        }
    };

	const kycLevels = {
		1: { label: "Tier 1 — Unverified", color: "text-amber-500", bg: "bg-amber-50", icon: <ShieldAlert size={14} /> },
		2: { label: "Tier 2 — BVN Verified", color: "text-blue-500", bg: "bg-blue-50", icon: <ShieldCheck size={14} /> },
		3: { label: "Tier 3 — Fully Verified", color: "text-green-500", bg: "bg-green-50", icon: <BadgeCheck size={14} /> },
	};
	const kyc = kycLevels[user?.kycLevel || 1];

	const initials = user?.firstName && user?.lastName
		? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
		: (user?.username?.[0] || "U").toUpperCase();

	// Reusable row component
	const SettingRow = ({ icon: Icon, iconBg = "bg-slate-100", iconColor = "text-slate-600", label, sublabel, right, onClick, danger }) => (
		<div
			onClick={onClick}
			className={`w-full flex items-center justify-between p-4 active:bg-slate-50 transition-colors group cursor-pointer ${danger ? "hover:bg-red-50" : ""}`}
		>
			<div className="flex items-center space-x-4">
				<div className={`${iconBg} ${iconColor} p-2.5 rounded-[0.75rem]`}>
					<Icon size={18} />
				</div>
				<div className="text-left">
					<p className={`text-sm font-black ${danger ? "text-red-500" : "text-slate-900"}`}>{label}</p>
					{sublabel && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{sublabel}</p>}
				</div>
			</div>
			{right || <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />}
		</div>
	);

	const Toggle = ({ checked }) => (
		<div
			className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#E4570A]" : "bg-slate-200"}`}
		>
			<span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
		</div>
	);

	const Section = ({ title, children }) => (
		<div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
			{title && (
				<div className="px-5 pt-5 pb-3">
					<h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
				</div>
			)}
			<div className="divide-y divide-slate-50">{children}</div>
		</div>
	);

	return (
		<div className="space-y-5 pb-8">
			{/* Profile Hero */}
			<div className="bg-[#013653] rounded-[2rem] p-7 text-white relative overflow-hidden shadow-lg shadow-[#013653]/20">
				<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
				<div className="relative z-10 flex items-center space-x-5">
					<div className="h-20 w-20 bg-[#E4570A] rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-[#E4570A]/30 shrink-0">
						{initials}
					</div>
					<div>
						<h2 className="text-2xl font-black tracking-tight">
							{user?.firstName && user?.lastName
								? `${user.firstName} ${user.lastName}`
								: user?.username || "User"}
						</h2>
						<p className="text-sm text-slate-300 font-medium mt-1">{user?.email}</p>
						<div className={`inline-flex items-center space-x-1.5 mt-3 px-3 py-1.5 rounded-full ${kyc.bg}`}>
							<span className={kyc.color}>{kyc.icon}</span>
							<span className={`text-[9px] font-black uppercase tracking-widest ${kyc.color}`}>{kyc.label}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Account */}
			<Section title="Account">
				<SettingRow icon={User} iconBg="bg-blue-50" iconColor="text-blue-500"
					label="Personal Information"
					sublabel={user?.phone || "Update your profile"}
					onClick={() => setActiveModal("edit")}
				/>
				<SettingRow icon={kyc.color === "text-amber-500" ? ShieldAlert : ShieldCheck}
					iconBg={user?.kycLevel === 1 ? "bg-amber-50" : "bg-blue-50"}
					iconColor={user?.kycLevel === 1 ? "text-amber-500" : "text-blue-500"}
					label="Identity Verification"
					sublabel={kyc.label}
					onClick={() => user?.kycLevel === 1 && setActiveModal("kyc")}
					right={user?.kycLevel > 1 ? <BadgeCheck size={18} className="text-green-500" /> : <ChevronRight size={16} className="text-slate-300" />}
				/>
			</Section>

			{/* Appearance & Notifications */}
			<Section title="Preferences">
				<SettingRow
					icon={isDark ? Moon : Sun}
					iconBg={isDark ? "bg-slate-800" : "bg-amber-50"}
					iconColor={isDark ? "text-amber-300" : "text-amber-500"}
					label="Dark Mode"
					sublabel={isDark ? "Dark theme is on" : "Light theme is on"}
					onClick={toggleTheme}
					right={<Toggle checked={isDark} />}
				/>
				<SettingRow
					icon={notifs.push ? Bell : BellOff}
					iconBg="bg-purple-50" iconColor="text-purple-500"
					label="Push Notifications"
					sublabel={notifs.push ? "Alerts enabled" : "Alerts muted"}
					onClick={() => handleToggleNotif("push")}
					right={<Toggle checked={notifs.push} />}
				/>
				<SettingRow
					icon={Mail}
					iconBg="bg-green-50" iconColor="text-green-500"
					label="Email Notifications"
					sublabel={notifs.email ? "Email alerts on" : "Email alerts off"}
					onClick={() => handleToggleNotif("email")}
					right={<Toggle checked={notifs.email} />}
				/>
				<SettingRow
					icon={Phone}
					iconBg="bg-teal-50" iconColor="text-teal-500"
					label="SMS Notifications"
					sublabel={notifs.sms ? "SMS alerts on" : "SMS alerts off"}
					onClick={() => handleToggleNotif("sms")}
					right={<Toggle checked={notifs.sms} />}
				/>
			</Section>

			{/* Security */}
			<Section title="Security">
				<SettingRow icon={KeyRound} iconBg="bg-orange-50" iconColor="text-[#E4570A]"
					label="Change Password"
					sublabel="Update your login password"
					onClick={() => setActiveModal("password")}
				/>
                <SettingRow icon={Fingerprint} iconBg="bg-blue-50" iconColor="text-blue-500"
					label="Biometric Login"
					sublabel={user?.biometrics?.enabled ? "FaceID/TouchID is active" : "Enable faster secure login"}
					onClick={handleToggleBiometrics}
					right={<Toggle checked={user?.biometrics?.enabled} />}
				/>
				<SettingRow icon={Lock} iconBg="bg-slate-900" iconColor="text-white"
					label="Transaction PIN"
					sublabel={user?.isPinSet ? "PIN is active" : "Set your secure PIN"}
					onClick={() => setActiveModal("pin")}
					right={user?.isPinSet ? <BadgeCheck size={16} className="text-green-400" /> : <ChevronRight size={16} className="text-slate-300" />}
				/>
				<SettingRow icon={Smartphone} iconBg="bg-indigo-50" iconColor="text-indigo-500"
					label="Current Session"
					sublabel={`${deviceName} • ${location}`}
					right={
						<div className="flex items-center space-x-2">
							<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
							<span className="text-[9px] font-black uppercase text-green-500 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">Active Now</span>
						</div>
					}
				/>
			</Section>

			{/* Help */}
			<Section title="Support">
				<SettingRow icon={HelpCircle} iconBg="bg-blue-50" iconColor="text-blue-400"
					label="Help Center"
					sublabel="FAQs and support articles"
					onClick={() => window.open("https://tranxxact.vercel.app/help", "_blank")}
				/>
				<SettingRow icon={Globe} iconBg="bg-teal-50" iconColor="text-teal-500"
					label="App Language"
					sublabel="English (US)"
					right={<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">English</span>}
				/>
			</Section>

			{/* Danger Zone */}
			<Section>
				<SettingRow icon={LogOut} iconBg="bg-red-50" iconColor="text-red-500"
					label="Log Out"
					sublabel="Sign out from this device"
					onClick={logout}
					danger
				/>
				<SettingRow icon={Trash2} iconBg="bg-red-50" iconColor="text-red-400"
					label="Delete Account"
					sublabel="Permanently remove your account"
					onClick={() => toast.error("Please contact support to delete your account.")}
					danger
				/>
			</Section>

			<p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-widest py-2">
				Tranxact v1.0.0 · Made with ❤️ in Nigeria
			</p>

			{/* Modals */}
			{activeModal === 'kyc' && <KycModal onClose={() => setActiveModal(null)} />}
			{activeModal === 'edit' && <EditProfileModal onClose={() => setActiveModal(null)} />}
			{activeModal === 'password' && <ChangePasswordModal onClose={() => setActiveModal(null)} />}
			{activeModal === 'pin' && <SetPinModal onClose={() => setActiveModal(null)} onRefresh={refreshUser} />}
		</div>
	);
};

export default ProfilePage;
