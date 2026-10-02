"use client"
import { cn } from '@/lib/utils'
import { CopyCheck, CopyIcon } from 'lucide-react'
import { useState } from 'react'

const buttonClasses = 'shine-edge flex cursor-pointer items-center rounded text-xs font-medium'

export interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2500)
  }

  return (
    <button
      type="button"
      disabled={isCopied}
      onClick={copy}
      aria-label={isCopied ? "Code copied" : "Copy code"}
      className={cn(buttonClasses, className, "code-copy-button absolute right-2 top-2 z-10 gap-1.5 px-2 py-1")}
    >
      {isCopied ? <CopyCheck size={16} /> : <CopyIcon size={16} />}
      <span>{isCopied ? ' Copied!' : ' Copy'}</span>
    </button>
  )
}
