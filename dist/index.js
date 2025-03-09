export default class Dify {
    constructor(url, apiKey) {
        this.url = url;
        this.apiKey = apiKey;
    }
    headers() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    /**
     * Returns users's conversation id.
     *
     * @async
     * @param user - User object containing user information (e.g., id).
     * @returns A promise that resolves with the user's conversation id.
     */
    async findConversation(user) {
        const req = await fetch(`${this.url}/conversations?${new URLSearchParams({ user, limit: String(1) }).toString()}`, {
            method: 'GET',
            headers: this.headers()
        });
        let conversations = await req.json();
        if (conversations.data.length > 0) {
            return conversations.data[0].id;
        }
        else {
            return '';
        }
    }
    async userHasConversations(user) {
        const req = await fetch(`${this.url}/conversations?${new URLSearchParams({ user, limit: String(1) }).toString()}`, {
            method: 'GET',
            headers: this.headers()
        });
        let conversations = await req.json();
        return conversations.data.length > 0;
    }
    /**
     * Sends a message to a user and retrieves the response.
     *
     * @async
     * @param message - The message to be sent.
     * @param customerPhone - The phone of the customer, used to idenfity in dify.
     * @param conversationId - A UUID identifying one of the customer's conversations.
     * @returns A promise that resolves with the bot's response to the message.
     */
    async sendMessage(message, customerPhone, conversationId, inputs // Dify has an optional input field, to send along the message, here we can add variables.
    ) {
        const data = {
            'inputs': inputs,
            'query': message,
            'response_mode': 'blocking',
            'conversation_id': conversationId ?? '',
            'user': customerPhone,
        };
        let answer = await fetch(`${this.url}/chat-messages`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(data)
        });
        let chatCompletion = await answer.json();
        return {
            answer: chatCompletion.answer,
            conversation_id: chatCompletion.conversation_id
        };
    }
    /**
     * Deletes a conversation.
     *
     * @async
     * @param conversationId - The ID of the conversation to be deleted.
     * @param userId - The user's ID who initiated the conversation.
     * @returns A promise that resolves with the response from the server.
     */
    async deleteConversation(conversationId, userId) {
        const data = { 'user': userId };
        const answer = await fetch(`${this.url}/conversations/${conversationId}`, {
            method: "DELETE",
            headers: this.headers(),
            body: JSON.stringify(data)
        });
        return answer;
    }
    /**
     * Returns the conversation history messages for a user.
     *
     * @async
     * @param userId - The ID of the user who initiated the conversation.
     * @returns A promise that resolves with an array of conversation history messages.
     */
    async getConversationHistoryMessages(userId) {
        const conversationId = await this.findConversation(userId);
        if (conversationId.length > 0) {
            const conversation = await fetch(`${this.url}/messages?user=${userId}&conversation_id=${conversationId}`, {
                headers: this.headers()
            });
            return conversation;
        }
    }
}
