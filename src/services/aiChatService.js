import { supabase } from '../config/supabaseClients'

export const aiChatService = {
  async sendMessage(messages) {
    const { data, error } = await supabase.functions.invoke('ledgerly-ai-chat', {
      body: {
        messages: messages.map(({ from, text }) => ({
          role: from === 'assistant' ? 'assistant' : 'user',
          content: text,
        })),
      },
    })

    if (error) {
      const message = await getFunctionErrorMessage(error)
      throw new Error(message)
    }

    return data
  },
}

async function getFunctionErrorMessage(error) {
  if (error.context?.json) {
    try {
      const payload = await error.context.clone().json()
      return payload.error || error.message || 'Unable to reach Billing Assistant.'
    } catch {
      return error.message || 'Unable to reach Billing Assistant.'
    }
  }

  return error.message || 'Unable to reach Billing Assistant.'
}
