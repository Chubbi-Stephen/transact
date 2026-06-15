import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import WelcomeSection from "../../components/features/Dashboard/WelcomeSection";
import BalanceCard from "../../components/features/Dashboard/BalanceCard";
import QuickActions from "../../components/features/Dashboard/QuickActions";
import TransactionHistory from "../../components/features/Transactions/TransactionHistory";
import SpendingAnalytics from "../../components/features/Dashboard/SpendingAnalytics";
import AIHealthCard from "../../components/features/Dashboard/AIHealthCard";
import SafelockSection from "../../components/features/Dashboard/SafelockSection";
import ReferralCard from "../../components/features/Dashboard/ReferralCard";
import TVaultCard from "../../components/features/Dashboard/TVaultCard";
import BudgetOverview from "../../components/features/Budget/BudgetOverview";
import ForecastingSection from "../../components/features/Dashboard/ForecastingSection";


const HomePage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}><WelcomeSection /></motion.div>
            <motion.div variants={itemVariants}><AIHealthCard refreshTrigger={refreshTrigger} /></motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BalanceCard onRefresh={handleRefresh} />
                <QuickActions onRefresh={handleRefresh} />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ForecastingSection refreshTrigger={refreshTrigger} />
                <BudgetOverview refreshTrigger={refreshTrigger} />
            </motion.div>


            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TVaultCard />
                <ReferralCard />
            </motion.div>
            
            <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest">Recent Activity</h3>
                    <Link to="/transactions" className="text-[#E4570A] font-black text-[10px] uppercase tracking-widest flex items-center space-x-1 hover:translate-x-1 transition-all">
                        <span>See All</span>
                        <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
                    <TransactionHistory limit={5} refreshTrigger={refreshTrigger} />
                </div>

            </motion.div>
            
            <motion.div variants={itemVariants}><SafelockSection refreshTrigger={refreshTrigger} onRefresh={handleRefresh} /></motion.div>
            <motion.div variants={itemVariants}><SpendingAnalytics refreshTrigger={refreshTrigger} /></motion.div>
        </motion.div>
    );
};

export default HomePage;
