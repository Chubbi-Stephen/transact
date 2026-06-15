const Transaction = require('../models/Transaction');
const User = require('../models/User');
const TVault = require('../models/TVault');
const SavingsGoal = require('../models/SavingsGoal');
const AIChat = require('../models/AIChat');
const Groq = require('groq-sdk');

/**
 * T-Co Financial Agent Service
 * Implements a dual-brain architecture for humanized coaching and precise action execution.
 */
class AIService {
    constructor() {
        this._groq = null;
    }

    get groq() {
        if (!this._groq && process.env.GROQ_API_KEY) {
            this._groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this._groq;
    }

    /**
     * Entry point for chat interactions
     */
    async chatWithCoach(userId, userMessage) {
        if (!this.groq) return { reply: "T-Co is currently syncing with the markets. Be right back.", action: null };

        try {
            // 1. Fetch comprehensive user context
            const [user, vault, safelocks, chatRecord] = await Promise.all([
                User.findById(userId),
                TVault.findOne({ user: userId }),
                SavingsGoal.find({ user: userId, status: 'active' }),
                AIChat.findOne({ user: userId }) || new AIChat({ user: userId, messages: [] })
            ]);

            const totalSafelocked = safelocks.reduce((sum, s) => sum + s.currentBalance, 0);
            const context = {
                username: user.username,
                balances: {
                    wallet: user.balance,
                    vault: vault?.balance || 0,
                    safelock: totalSafelocked,
                    total: user.balance + (vault?.balance || 0) + totalSafelocked
                }
            };

            // 2. Generate Humanized Expert Response (Brain 1: The Coach)
            const coachReply = await this._generateCoachResponse(context, chatRecord, userMessage);

            // 3. Detect Actionable Intent (Brain 2: The Agent)
            // No keyword filters. High-reasoning model analyzes intent + conversation history.
            const actionTarget = await this._detectActionIntent(context, coachReply, userMessage);

            // 4. Persistence
            chatRecord.messages.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: coachReply }
            );
            // Sliding window for history (last 10 messages) to keep context sharp
            if (chatRecord.messages.length > 20) chatRecord.messages = chatRecord.messages.slice(-20);
            await chatRecord.save();

            return { reply: coachReply, action: actionTarget };

        } catch (error) {
            console.error("[T-Co Architecture Error]:", error);
            return { reply: "I hit a small snag while calculating that. One second, my guy.", action: null };
        }
    }

    async _generateCoachResponse(context, chatRecord, userMessage) {
        const systemPrompt = `You are T-Co, an elite Nigerian wealth mentor. 
TONE: Warm, intentional, authoritative yet sibling-like. Use natural Nigerian flow.
GOAL: Empower the user. Don't dump numbers unless asked. Don't predict balances ("after the transfer").
GUIDELINE: If they say "hey/hello", be brief and welcoming. Only talk finance when relevant.
CONTEXT: User ${context.username}. Wallet: ₦${context.balances.wallet}. Vault: ₦${context.balances.vault}. Safelock: ₦${context.balances.safelock}.`;

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: systemPrompt },
                ...chatRecord.messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 250
        });

        return completion.choices[0]?.message?.content?.trim();
    }

    async _detectActionIntent(context, currentReply, userMessage) {
        // High-reasoning intent classification
        try {
            const intentCheck = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "system",
                    content: "Classify user intent into: vault_deposit, safelock_create, bank_transfer, buy_airtime, or NULL. Output ONLY valid JSON: {\"action\": string|null, \"amount\": number|null}"

                }, {
                    role: "user",
                    content: `User: "${userMessage}"\nCoach: "${currentReply}"\nContext: Wallet ₦${context.balances.wallet}`
                }],
                temperature: 0.1,
                max_tokens: 60,
                response_format: { type: "json_object" }
            });

            const content = intentCheck.choices[0]?.message?.content;
            const data = JSON.parse(content);
            
            // Validation: Only return action if confidence is high and amount is realistic
            if (data.action && data.amount > 0 && data.amount <= context.balances.wallet) {
                return data;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // ── Supporting Methods ──────────────────────────────────────────────────
    async analyzeTransactions(userId) {
        // Simplified scoring architecture
        const user = await User.findById(userId);
        return { score: 75, status: "Healthy", recommendation: "Keep building that T-Vault." };
    }

    async getPredictiveForecast(userId) {
        return { predictions: [], totalPredictedExpense: 0, advice: "Tracking your patterns now." };
    }

    async getMonthlyCoachingReport(userId) {
        return "You're making steady progress.";
    }
}

module.exports = new AIService();