import { config } from 'dotenv'
config({ path: '.env.local' })
import { MongoClient } from 'mongodb'

async function main() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB
  if (!uri || !dbName) throw new Error('MONGODB_URI and MONGODB_DB must be set in .env.local')

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  const elections = db.collection('elections')
  await elections.createIndex({ created_at: -1 })
  console.log('elections: created index { created_at: -1 }')

  const voterTokens = db.collection('voter_tokens')
  await voterTokens.createIndex({ token: 1 }, { unique: true })
  await voterTokens.createIndex({ election_id: 1, used: 1 })
  console.log('voter_tokens: created indexes on token (unique) and (election_id, used)')

  const votes = db.collection('votes')
  await votes.createIndex({ election_id: 1 })
  await votes.createIndex({ election_id: 1, position_id: 1, nominee_id: 1 })
  await votes.createIndex({ election_id: 1, submitted_at: 1 })
  console.log('votes: created indexes on election_id, (election_id, position_id, nominee_id), (election_id, submitted_at)')

  await client.close()
  console.log('\nAll indexes created successfully.')
}

main().catch((err) => { console.error(err); process.exit(1) })
