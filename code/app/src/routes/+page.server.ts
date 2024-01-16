import type { Actions, PageServerLoad } from './$types'
import pkg from 'pg'
import pgvector from 'pgvector/pg'
import { PGUSER, PGPASSWORD, PGHOST, PGDATABASE, PGPORT, PGSSL } from '$env/static/private'

const { Client } = pkg

const addSslSettings = () => {
    return PGSSL === 'true'
        ? {}
        : {
              ssl: {
                  rejectUnauthorized: false,
              },
          }
}
const getDBClientConfig = () => {
    const baseConfig = {
        user: PGUSER,
        password: PGPASSWORD,
        host: PGHOST,
        database: PGDATABASE,
        port: Number(PGPORT),
    }

    return {
        ...baseConfig,
        ...addSslSettings(),
    }
}

export const load: PageServerLoad = async () => {
    const client = new Client(getDBClientConfig())
    await client.connect()
    const posts = await client.query('SELECT * from wp_posts_en where has_embeddings = false order by id')
    await client.end()

    return {
        posts: posts.rows,
    }
}

export const actions = {
    saveEmbedding: async ({ request }) => {
        const client = new Client(getDBClientConfig())

        const data = await request.formData()
        const post_id = data.get('post_id')
        const post_title = data.get('post_title')
        const guid = data.get('guid')
        const embedding = data.get('embedding')

        // INSERT INTO "public"."embeddings" ("embedding", "text") VALUES ('[0]', 'tetst');
        const insert = 'INSERT INTO embeddings(embedding, post_title, post_guid) VALUES($1, $2,$3) RETURNING *'
        const inserValues = [embedding, post_title, guid]

        const update = 'UPDATE wp_posts_en SET has_embeddings = true where id=$1'
        const updateValues = [post_id]

        await client.connect()
        const resInsert = await client.query(insert, inserValues)
        const resUpdate = await client.query(update, updateValues)

        await client.end()
        return { resUpdate: resUpdate.rows[0], resInsert: resInsert.rows[0] }
    },

    search: async ({ request }) => {
        const client = new Client(getDBClientConfig())

        const data = await request.formData()
        const embedding = data.get('embedding') as string
        await client.connect()
        const result = await client.query('SELECT * FROM embeddings ORDER BY embedding <-> $1 LIMIT 50', [
            pgvector.toSql(
                embedding.split(',').map(function (str) {
                    return parseFloat(str)
                }),
            ),
        ])

        return { result: result.rows }
    },
} satisfies Actions
