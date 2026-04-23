'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeDisplay({
  value,
  size = 128,
}: {
  value: string
  size?: number
}) {
  return (
    <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block flex-shrink-0">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  )
}
