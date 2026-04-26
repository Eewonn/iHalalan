export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getClient } from '@/lib/mongo'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ electionId: string }> }
) {
  const { electionId } = await params
  const client = await getClient()
  const db = client.db(process.env.MONGODB_DB!)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const changeStream = db.collection('votes').watch(
        [
          {
            $match: {
              operationType: 'insert',
              'fullDocument.election_id': electionId,
            },
          },
        ],
        { fullDocument: 'updateLookup' }
      )

      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
          const { _id: docId, ...rest } = change.fullDocument as Record<string, unknown>
          send(JSON.stringify({ ...rest, id: docId }))
        }
      })

      req.signal.addEventListener('abort', () => {
        changeStream.close()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
