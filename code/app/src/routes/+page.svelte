<script lang="ts">
    import { enhance } from '$app/forms'
    import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers'
    import { onMount } from 'svelte'

    export let data: {
        posts: { id: number; post_title: string; post_content: string; guid: string; has_embeddings: boolean }[]
    }

    let initialised = false
    let showTransformedData = false
    let loading = false
    let searchNeedle = ''
    let idsConverted: string[] = []
    let searchResults: { id: number; post_id: number; post_title: string; post_content: string; post_guid: string }[] =
        []

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
        const post_title = form.formData.get('post_title') as string
        const post_content = form.formData.get('post_content') as string
        const post_id = form.formData.get('post_id') as string

        idsConverted = [...idsConverted, post_id]

        const embedding = await model.embedDocuments([post_title + ' ' + post_content])

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

<div class="min-h-screen relative flex flex-wrap">
    <div class="grid grid-cols-12 w-full">
        <div class="col-span-10 col-start-2 xl:col-span-8 xl:col-start-3 mt-2 mb-4">
            <div class="flex flex-col">
                <div class="mt-8 text-slate-700 flex space-x-2 text-sm font-semibold">
                    <span
                        >Status / {#if !initialised || loading}loading...{:else}
                            ready.{/if}
                    </span>
                </div>
                <h1 class="mt-3 mb-2 text-2xl font-bold tracking-tight text-slate-900">woof & wiggle</h1>
            </div>

            <div class:opacity-20={!initialised}>
                <form method="POST" action="?/search" use:enhance={search}>
                    <div class="mt-2 flex rounded-md shadow-sm">
                        <div class="relative flex flex-grow items-stretch focus-within:z-10">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    class="w-6 h-6"
                                >
                                    <path
                                        d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                bind:value={searchNeedle}
                                name="search"
                                class="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Search for Product"
                            />
                        </div>
                        <button
                            class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                class="w-6 h-6"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            AI Search
                        </button>
                    </div>
                </form>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-8">
                {#each searchResults as searchResult}
                    <div
                        class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                    >
                        <div class="min-w-0 flex-1">
                            <a
                                href={searchResult.post_guid.replace('#038;', '')}
                                target="_blank"
                                class="focus:outline-none"
                            >
                                <span class="absolute inset-0" aria-hidden="true"></span>
                                <p class="text-sm font-medium text-gray-900">{searchResult.post_title}</p>
                                <p class="truncate text-sm text-gray-500">Id: {searchResult.post_id}</p>
                            </a>
                        </div>
                    </div>
                {/each}
            </div>
            <button
                on:click={() => (showTransformedData = !showTransformedData)}
                class="mt-8 rounded-md bg-white font-medium text-slate-600 text-xs hover:text-slate-500"
            >
                {showTransformedData ? 'hide' : 'show'} transformed data
            </button>
        </div>

        {#if showTransformedData}
            <div class="col-span-10 col-start-2 xl:col-span-8 xl:col-start-3 mt-10" class:opacity-20={!initialised}>
                <div class="px-4 sm:px-0">
                    <h3 class="text-base font-semibold leading-7 text-gray-900">Raw Data</h3>
                    <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                        This data is converted into AI Embeddings
                    </p>
                </div>
                <div class="mt-6 border-t border-gray-200">
                    <dl class="divide-y divide-gray-200">
                        {#each posts as post}
                            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">
                                    {post.post_title.slice(0, 80)}
                                </dt>
                                <dd class="mt-1 flex text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                    <span class="flex-grow"
                                        >{post.post_content.replace(/(<([^>]+)>)/gi, '').slice(0, 512)}</span
                                    >
                                    <span class="ml-4 flex-shrink-0">
                                        <form method="POST" action="?/saveEmbedding" use:enhance={saveEmbedding}>
                                            <input hidden name="post_id" value={post.id} />
                                            <input hidden name="post_title" value={post.post_title} />
                                            <input
                                                hidden
                                                name="post_content"
                                                value={post.post_content.replace(/(<([^>]+)>)/gi, '')}
                                            />
                                            <input hidden name="guid" value={post.guid} />
                                            <button
                                                class="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                                                disabled={post.has_embeddings}
                                            >
                                                {#if !idsConverted.includes(post.id.toString()) && !post.has_embeddings}
                                                    Convert
                                                {:else}
                                                    Converted
                                                {/if}
                                            </button>
                                        </form>
                                    </span>
                                </dd>
                            </div>
                        {/each}
                    </dl>
                </div>
            </div>
        {/if}
    </div>

    <div class="self-end grid grid-cols-12 w-full">
        <div class="col-span-10 col-start-2 xl:col-span-8 xl:col-start-3 mt-2 mb-4">
            <div class="mt-6 pt-2 border-t border-gray-200 text-sm leading-6 text-gray-700">
                Code: <a class="font-bold" href="https://github.com/alexmilde/woof-and-wiggle"
                    >github.com/alexmilde/woof-and-wiggle</a
                >
                – Data woofandwiggle.com: Rainer Rösing
                <a class="font-bold" href="https://rainerroesing.de/">rainerroesing.de</a>
            </div>
        </div>
    </div>
</div>
