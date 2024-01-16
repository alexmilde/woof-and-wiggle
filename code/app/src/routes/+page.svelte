<script lang="ts">
    import { enhance } from '$app/forms'
    import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers'
    import { onMount } from 'svelte'

    export let data: {
        posts: { id: number; post_title: string; post_content: string; guid: string }[]
    }

    let initialised = false
    let loading = false
    let searchNeedle = ''
    let idsConverted: string[] = []
    let searchResults: { id: number; post_title: string; post_content: string; post_guid: string }[] = []

    const { posts } = data

    const model = new HuggingFaceTransformersEmbeddings({
        modelName: 'Xenova/all-MiniLM-L6-v2',
    })

    onMount(async () => {
        await refreshEmbeddingsAndStore()
        initialised = true
    })

    const refreshEmbeddingsAndStore = async () => {
        await model.embedDocuments([''])
    }

    const saveEmbedding = async (form: { formData: FormData }) => {
        loading = true
        const post_content = form.formData.get('post_content') as string
        const post_id = form.formData.get('post_id') as string

        idsConverted = [...idsConverted, post_id]

        const embedding = await model.embedDocuments([post_content])

        form.formData.append('embedding', '[' + embedding.toString() + ']')
        return async () => {
            loading = false
        }
    }
    const search = async (form: { formData: FormData }) => {
        loading = true
        const embedding = await model.embedDocuments([searchNeedle])
        form.formData.append('embedding', embedding.toString())

        return async ({ result }) => {
            searchResults = result.data.result
            console.log(searchResults)
            loading = false
        }
    }
</script>

<div class="grid grid-cols-12">
    <div class="col-span-10 col-start-2 my-4 text-2xl">
        {#if !initialised}Loading{/if}
        {#if loading}Loading{/if}
    </div>
    <div class="col-span-10 col-start-2 mb-4" class:opacity-20={!initialised}>
        <form method="POST" action="?/search" use:enhance={search}>
            <input class="border px-2 py-2" bind:value={searchNeedle} name="search" />
            <button>Search</button>
        </form>
        <div>
            <ul>
                {#each searchResults as searchResult}
                    <li class="my-2">
                        <a href={searchResult.post_guid.replace('#038;', '')}>
                            [{searchResult.id}] {searchResult.post_title}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
    <div class="col-span-10 col-start-2" class:opacity-20={!initialised}>
        <table>
            <tr>
                <th>id</th>
                <th>title</th>
                <th>content</th>
                <th>action</th>
            </tr>
            {#each posts as post}
                <tr>
                    <td>{post.id}</td>
                    <td>{post.post_title.slice(0, 40)}</td>
                    <!--<td>{post.post_content.slice(0, 125)}</td>-->
                    <td>{post.post_content.replace(/(<([^>]+)>)/gi, '').slice(0, 125)}</td>
                    <td>
                        <form method="POST" action="?/saveEmbedding" use:enhance={saveEmbedding}>
                            <input hidden name="post_id" value={post.id} />
                            <input hidden name="post_title" value={post.post_title} />
                            <input hidden name="post_content" value={post.post_content.replace(/(<([^>]+)>)/gi, '')} />
                            <input hidden name="guid" value={post.guid} />
                            <button>
                                {#if !idsConverted.includes(post.id.toString())}
                                    Convert
                                {/if}
                            </button>
                        </form>
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
