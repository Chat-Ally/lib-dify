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
    limit: number;
    has_more?: boolean;
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
    answer: string;
    conversation_id: string;
}
export interface CustomerBusinessNumbers {
    customerPhoneNumber: string;
    businessPhoneNumber: string;
}
export default class Dify {
    private url;
    private apiKey;
    constructor(url: string, apiKey: string);
    private headers;
    /**
     * Returns users's conversation id.
     *
     * @async
     * @param user - User object containing user information (e.g., id).
     * @returns A promise that resolves with the user's conversation id.
     */
    findConversation(user: string): Promise<string>;
    userHasConversations(user: string): Promise<boolean>;
    /**
     * Sends a message to a user and retrieves the response.
     *
     * @async
     * @param message - The message to be sent.
     * @param customerPhone - The phone of the customer, used to idenfity in dify.
     * @param conversationId - A UUID identifying one of the customer's conversations.
     * @returns A promise that resolves with the bot's response to the message.
     */
    sendMessage(message: string, customerPhone: string, conversationId?: UUID, inputs?: CustomerBusinessNumbers): Promise<SendMessageResponse>;
    /**
     * Deletes a conversation.
     *
     * @async
     * @param conversationId - The ID of the conversation to be deleted.
     * @param userId - The user's ID who initiated the conversation.
     * @returns A promise that resolves with the response from the server.
     */
    deleteConversation(conversationId: string, userId: string): Promise<any>;
    /**
     * Returns the conversation history messages for a user.
     *
     * @async
     * @param userId - The ID of the user who initiated the conversation.
     * @returns A promise that resolves with an array of conversation history messages.
     */
    getConversationHistoryMessages(userId: string): Promise<any>;
}
