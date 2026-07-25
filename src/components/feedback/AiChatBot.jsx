import { useEffect, useRef, useState } from 'react'
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi'
import { aiChatService } from '../../services/aiChatService'

const starterMessages = [
  {
    from: 'assistant',
    text: 'Hi, I am Billing Assistant. Ask me about invoices, clients, billing, PDFs, receipts, or dashboard workflows.',
  },
]

export function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState(starterMessages)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const scrollTimer = window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)

      return () => window.clearTimeout(scrollTimer)
    }
  }, [isOpen, messages, isSending])

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = String(formData.get('message') || '').trim()

    if (!message || isSending) return

    const nextMessages = [...messages, { from: 'user', text: message }]

    setMessages(nextMessages)
    setError('')
    setIsSending(true)
    event.currentTarget.reset()

    try {
      const data = await aiChatService.sendMessage(nextMessages)
      setMessages((current) => [
        ...current,
        {
          from: 'assistant',
          text: data.reply || 'I could not generate a reply. Please try again.',
        },
      ])
    } catch (chatError) {
      setError(chatError.message || 'Billing Assistant is unavailable right now.')
      setMessages((current) => [
        ...current,
        {
          from: 'assistant',
          text: getUnavailableMessage(chatError.message),
        },
      ])
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      {isOpen ? (
        <section className="fixed bottom-24 right-5 z-40 flex h-[min(70vh,520px)] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-lg border border-[var(--paper-line)] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--paper-line)] bg-[#0B0F17] px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold text-white/70">Billing Assistant</h2>
              <p className="text-xs text-white/70">AI help for your billing workflow</p>
            </div>
            <button
              aria-label="Close assistant"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
                  message.from === 'user'
                    ? 'ml-auto bg-[#0B0F17] text-white'
                    : 'bg-[var(--paper-dim)] text-[var(--text)]'
                }`}
                key={`${message.from}-${index}-${message.text}`}
              >
                {message.from === 'assistant' ? (
                  <FormattedAssistantMessage text={message.text} />
                ) : (
                  message.text
                )}
              </div>
            ))}
            {isSending ? (
              <div className="max-w-[85%] rounded-lg bg-[var(--paper-dim)] px-3 py-2 text-sm text-[var(--mist)]">
                Thinking...
              </div>
            ) : null}
            {error ? (
              <p className="rounded-lg bg-[var(--rust-dim)] px-3 py-2 text-xs text-[var(--rust)]">
                {error}
              </p>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form className="flex gap-2 border-t border-[var(--paper-line)] p-3" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="assistant-message">
              Ask Billing Assistant
            </label>
            <input
              className="min-h-10 flex-1 rounded-md border border-[var(--paper-line)] bg-white px-3.5 text-sm outline-none transition hover:border-[var(--mist)] focus:border-[#0B0F17] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)]"
              id="assistant-message"
              name="message"
              placeholder="Ask a question..."
              ref={inputRef}
              disabled={isSending}
              type="text"
            />
            <button
              aria-label="Send message"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0B0F17] text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSending}
              type="submit"
            >
              <FiSend aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}

      <button
        aria-label="Open assistant"
        className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#0B0F17] text-white transition hover:-translate-y-0.5"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <FiMessageCircle aria-hidden="true" className="size-6" />
      </button>
    </>
  )
}

function FormattedAssistantMessage({ text }) {
  const blocks = normalizeAssistantText(text).split('\n').filter(Boolean)

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        const numberedMatch = block.match(/^(\d+)\.\s+(.+)$/)

        if (numberedMatch) {
          return (
            <p className="flex gap-2" key={`${block}-${index}`}>
              <span className="font-mono text-xs font-semibold text-[var(--mist)]">
                {numberedMatch[1]}.
              </span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </p>
          )
        }

        const bulletMatch = block.match(/^[-•]\s+(.+)$/)

        if (bulletMatch) {
          return (
            <p className="flex gap-2" key={`${block}-${index}`}>
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0B0F17]" />
              <span>{renderInlineFormatting(bulletMatch[1])}</span>
            </p>
          )
        }

        return <p key={`${block}-${index}`}>{renderInlineFormatting(block)}</p>
      })}
    </div>
  )
}

function normalizeAssistantText(text) {
  return String(text || '')
    .replace(/\\([*_`])/g, '$1')
    .replace(/\*{4}([^*\n]+?)\*{4}/g, '**$1**')
    .replace(/\*\*([^*\n]+?):\*{4}/g, '**$1:**')
    .replace(/\*{3,}/g, '**')
    .replace(/\s+(\d+\.\s+)/g, '\n$1')
    .replace(/\s+[-•]\s+/g, '\n- ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function renderInlineFormatting(text) {
  const cleanText = String(text || '').replace(/\*\*+/g, '**')
  const parts = cleanText.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong className="font-semibold text-[var(--text)]" key={`${part}-${index}`}>
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part.replace(/\*\*/g, '')
  })
}

function getUnavailableMessage(message = '') {
  if (message.toLowerCase().includes('free ai limit')) {
    return 'I have reached the free AI limit for now. Please try again later.'
  }

  if (message.toLowerCase().includes('configured')) {
    return 'I am not fully configured yet. Please try again after the assistant setup is complete.'
  }

  return 'I am having trouble connecting right now. Please try again shortly.'
}

