import { useState } from "react";
import { CreditCard, Landmark, UserCircle2, Smartphone, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import SendMoneyModal from "../Modals/SendMoneyModal";
import BankTransferModal from "../Modals/BankTransferModal";
import ReceiveMoneyModal from "../Modals/RecieveMoneyModal";
import FundWalletModal from "../Modals/FundWalletModal";
import BillsModal from "../Modals/BillsModal";
import AirtimeModal from "../Modals/AirtimeModal";

const QuickActions = ({ onRefresh }) => {
	const [activeModal, setActiveModal] = useState(null);

	const ActionButton = ({ icon: Icon, label, onClick, delay = 0 }) => (
		<motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center group flex-1" 
            onClick={onClick}
        >
			<div className="bg-white h-14 w-14 rounded-[1.2rem] flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all border border-slate-50 relative overflow-hidden">
				<div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<Icon size={22} className="text-[#E4570A] relative z-10" strokeWidth={2.5} />
			</div>
			<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
		</motion.button>
	);

	return (
		<>
			<div id="quick-actions-bar" className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
				<div className="flex justify-between items-center mb-8">
					<h3 className="text-slate-900 font-black text-xs uppercase tracking-widest">Quick Services</h3>
					<div className="bg-[#E4570A]/10 p-2 rounded-lg text-[#E4570A]"><LayoutGrid size={14} /></div>
				</div>

				<div className="flex justify-between items-start gap-2 relative z-10">
					<ActionButton icon={Landmark} label="Bank" onClick={() => setActiveModal("bank")} />
					<ActionButton icon={UserCircle2} label="P2P" onClick={() => setActiveModal("send")} />
					<ActionButton icon={Smartphone} label="Airtime" onClick={() => setActiveModal("airtime")} />
					<ActionButton icon={CreditCard} label="Bills" onClick={() => setActiveModal("pay")} />
				</div>

				<div className="absolute -top-10 -left-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl"></div>
			</div>

			{activeModal === "bank" && <BankTransferModal onClose={() => setActiveModal(null)} onRefresh={onRefresh} />}
			{activeModal === "send" && <SendMoneyModal onClose={() => setActiveModal(null)} onRefresh={onRefresh} />}
			{activeModal === "airtime" && <AirtimeModal onClose={() => setActiveModal(null)} onRefresh={onRefresh} />}
			{activeModal === "add" && <FundWalletModal onClose={() => setActiveModal(null)} onRefresh={onRefresh} />}
			{activeModal === "pay" && <BillsModal onClose={() => setActiveModal(null)} onRefresh={onRefresh} />}
			{activeModal === "receive" && <ReceiveMoneyModal onClose={() => setActiveModal(null)} />}
		</>
	);
};

export default QuickActions;
