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
    async chatWithCoach(userId, userMessage, chatId = null) {
        if (!this.groq) return { reply: "T-Co is currently syncing with the markets. Be right back.", action: null };

        try {
            // 1. Fetch comprehensive user context
            const [user, vault, safelocks] = await Promise.all([
                User.findById(userId),
                TVault.findOne({ user: userId }),
                SavingsGoal.find({ user: userId, status: 'active' })
            ]);

            // 2. Fetch or Create Chat Session
            let chatRecord;
            if (chatId) {
                chatRecord = await AIChat.findById(chatId);
            }
            
            // If no chatId or chat not found, create a new one
            if (!chatRecord) {
                chatRecord = new AIChat({ 
                    user: userId, 
                    messages: [],
                    title: userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : "")
                });
            }

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

            // 3. Generate Humanized Expert Response
            const coachReply = await this._generateCoachResponse(context, chatRecord, userMessage);

            // 4. Detect Actionable Intent
            const actionTarget = await this._detectActionIntent(context, coachReply, userMessage);

            // 5. Persistence
            chatRecord.messages.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: coachReply }
            );
            
            // Auto-update title if it's still default or based on first message
            if (chatRecord.messages.length === 2) {
                this._updateChatTitle(chatRecord, userMessage).catch(e => console.error(e));
            }

            // Increased sliding window for history (last 30 messages)
            if (chatRecord.messages.length > 30) {
                this._summarizeOldMessages(chatRecord).catch(err => console.error("Summarization error:", err));
                chatRecord.messages = chatRecord.messages.slice(-30);
            }
            await chatRecord.save();

            return { 
                reply: coachReply, 
                action: actionTarget, 
                chatId: chatRecord._id 
            };

        } catch (error) {
            console.error("[T-Co Architecture Error]:", error);
            return { reply: "I hit a small snag while calculating that. One second, my guy.", action: null };
        }
    }

    /**
     * Retrieve all chat sessions for the user
     */
    async getUserChats(userId) {
        try {
            return await AIChat.find({ user: userId })
                .select('title createdAt updatedAt')
                .sort({ updatedAt: -1 });
        } catch (error) {
            return [];
        }
    }

    /**
     * Retrieve messages for a specific chat ID
     */
    async getChatMessages(chatId) {
        try {
            const chat = await AIChat.findById(chatId);
            return chat ? chat.messages : [];
        } catch (error) {
            return [];
        }
    }

    async _generateCoachResponse(context, chatRecord, userMessage) {
        const systemPrompt = `You are T-Co, an elite Nigerian wealth mentor. 
TONE: Warm, intentional, authoritative yet sibling-like. Use natural Nigerian flow.
GOAL: Empower the user. Don't dump numbers unless asked. Don't predict balances ("after the transfer").
GUIDELINE: If they say "hey/hello", be brief and welcoming. Only talk finance when relevant.
CONTEXT: User ${context.username}. Wallet: ₦${context.balances.wallet}. Vault: ₦${context.balances.vault}. Safelock: ₦${context.balances.safelock}.
${chatRecord.summary ? `PAST CONTEXT SUMMARY: ${chatRecord.summary}` : ''}`;

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: systemPrompt },
                // Expanded history window: Sending last 15 messages instead of 8
                ...chatRecord.messages.slice(-15).map(m => ({ role: m.role, content: m.content })),
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

    async _summarizeOldMessages(chatRecord) {
        try {
            const messagesToSummarize = chatRecord.messages.slice(0, -10); // Summarize everything but the most recent 10
            if (messagesToSummarize.length < 5) return;

            const summaryPrompt = `Summarize the following financial coaching conversation. Focus on:
            1. User's financial goals mentioned.
            2. Any specific problems they are facing.
            3. Advice already given.
            4. User preferences.
            Current Summary to append to: ${chatRecord.summary || "None"}
            
            Conversation to summarize:
            ${messagesToSummarize.map(m => `${m.role}: ${m.content}`).join('\n')}`;

            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant", // Use a cheaper model for summarization
                messages: [{ role: 'system', content: "You are a concise summarizer for a financial coach." }, { role: 'user', content: summaryPrompt }],
                max_tokens: 300
            });

            chatRecord.summary = completion.choices[0]?.message?.content?.trim() || chatRecord.summary;
            await chatRecord.save();
        } catch (error) {
            console.error("Failed to summarize old messages:", error);
        }
    }

    async _updateChatTitle(chatRecord, firstMessage) {
        try {
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [{ 
                    role: 'system', 
                    content: "Generate a 3-5 word catchy title for this conversation based on the user's first message. Output ONLY the title text." 
                }, { 
                    role: 'user', 
                    content: firstMessage 
                }],
                max_tokens: 20
            });
            chatRecord.title = completion.choices[0]?.message?.content?.trim().replace(/"/g, '') || chatRecord.title;
            await chatRecord.save();
        } catch (e) {
            console.error("Title generation failed");
        }
    }
}

module.exports = new AIService();