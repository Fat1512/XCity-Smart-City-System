import type { MessageChatAI } from "../feature/chatbot/Chatbot";
import type { SendMessage } from "../feature/chatbot/useChatAI";
import { AI_REQUEST } from "../utils/axiosConfig";

export async function getChatAI({
  query,
  conversationId,
}: SendMessage): Promise<MessageChatAI> {
  try {
    const response = await AI_REQUEST.post<any>(`/rag/chat`, {
      query,
      conversation_id: conversationId,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Update failed");
  }
}
