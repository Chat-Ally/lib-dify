import type { UUID } from "crypto";

export interface Conversation {
    id: string;
    name: string;
    inputs: object;
    status: string;
    introduction: string;
    created_at: number;
    updated_at: number;
}

export interface Conversations {
    data: Conversation[];
    limit: number; // Number of entries returned
    has_more?: boolean; // optional property (if input exceeds system limit)
}

export interface DifyChatCompletion {
    event: "message";
    message_id: string;
    conversation_id: string;
    mode: "chat";
    answer: string;
    metadata: Metadata;
    created_at: number;
}

export interface Metadata {
    usage: Usage;
    retriever_resources: RetrieverResource[];
}

export interface Usage {
    prompt_tokens: number;
    prompt_unit_price: string;
    prompt_price_unit: string;
    prompt_price: string;
    completion_tokens: number;
    completion_unit_price: string;
    completion_price_unit: string;
    completion_price: string;
    total_tokens: number;
    total_price: string;
    currency: string;
    latency: number;
}

export interface RetrieverResource {
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    segment_id: string;
    score: number;
    content: string;
}

export interface SendMessageResponse {
    answer: string,
    conversation_id: string
}

export interface CustomerBusinessNumbers {
    customerPhoneNumber: string,
    businessPhoneNumber: string
}

export default class Dify {
    private url: string;
    private apiKey: string;

    constructor(url: string, apiKey: string) {
        this.url = url;
        this.apiKey = apiKey;
    }

    private headers(): { [key: string]: string } {
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
    async findConversation(user: string): Promise<string> {
        const req = await fetch(`${this.url}/conversations?${new URLSearchParams({ user, limit: String(1) }).toString()}`, {
            method: 'GET',
            headers: this.headers()
        });
        let conversations: Conversations = await req.json() as Conversations
        if (conversations.data.length > 0) {
            return conversations.data[0].id;
        } else {
            return '';
        }
    }

    async userHasConversations(user: string): Promise<boolean> {
        const req = await fetch(`${this.url}/conversations?${new URLSearchParams({ user, limit: String(1) }).toString()}`, {
            method: 'GET',
            headers: this.headers()
        });
        let conversations: Conversations = await req.json() as Conversations
        return conversations.data.length > 0
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
    async sendMessage(
        message: string,
        customerPhone: string,
        conversationId?: UUID,
        inputs?: CustomerBusinessNumbers // Dify has an optional input field, to send along the message, here we can add variables.
    ): Promise<SendMessageResponse> {
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

        let chatCompletion = await answer.json() as DifyChatCompletion
        return {
            answer: chatCompletion.answer,
            conversation_id: chatCompletion.conversation_id
        }
    }

    /**
     * Deletes a conversation.
     *
     * @async
     * @param conversationId - The ID of the conversation to be deleted.
     * @param userId - The user's ID who initiated the conversation.
     * @returns A promise that resolves with the response from the server.
     */
    async deleteConversation(conversationId: string, userId: string): Promise<any> {
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
    async getConversationHistoryMessages(userId: string): Promise<any> {
        const conversationId = await this.findConversation(userId);
        if (conversationId.length > 0) {
            const conversation = await fetch(`${this.url}/messages?user=${userId}&conversation_id=${conversationId}`, {
                headers: this.headers()
            });
            return conversation;
        }
    }
}