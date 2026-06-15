import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header/Header";
import BottomNavigation from "./Navigation/BottomNavigation";
import FloatingChat from "../features/Dashboard/FloatingChat";
import { useUI } from "../../context/UIContext";

// Global Modals
import BankTransferModal from "../features/Modals/BankTransferModal";
import SendMoneyModal from "../features/Modals/SendMoneyModal";
import AirtimeModal from "../features/Modals/AirtimeModal";
import BillsModal from "../features/Modals/BillsModal";
import FundWalletModal from "../features/Modals/FundWalletModal";

const Layout = () => {
    const location = useLocation();
    const { activeModal, closeModal, modalData } = useUI();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
            <Header />
            <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <BottomNavigation />
            <FloatingChat />

            {/* Global Modal Renderer */}
            <AnimatePresence>
                {activeModal === "bank" && <BankTransferModal onClose={closeModal} initialData={modalData} />}
                {activeModal === "send" && <SendMoneyModal onClose={closeModal} initialData={modalData} />}
                {activeModal === "airtime" && <AirtimeModal onClose={closeModal} initialData={modalData} />}
                {activeModal === "pay" && <BillsModal onClose={closeModal} initialData={modalData} />}
                {activeModal === "add" && <FundWalletModal onClose={closeModal} />}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
