import {toRef} from "vue";

export interface Context {
    params: object,
    searchIndex: number,
    prevUlr: string,
}

export function useSearchContext(
    initialContext: Context = {
        params: {},
        searchIndex: null,
        prevUrl: null,
    }
){
    const context: Ref<Context> = toRef<Context>(initialContext);

    const handleRedirect = (event: Event) => {
        event.preventDefault();
        if (event.button === 0 || event.button === 1){
            const href = event.target.getAttribute("href");
            const url = new URL(href, window.location.origin);
            const hash = url.hash.substring(1);
            let index = Number(sessionStorage.getItem(hash));
            let context = {
                params: this.data.filters,
                searchIndex: (this.data.search.page - 1) * this.data.search.limit + index, // rely on data or params?
                prev_url: window.location.href,
            }

            saveContextHash(hash, context);
        }
    }

    const getContextHash = () => {
        return window.btoa(Date.now().toString())
    }

    const saveContextHash = (hash: string, context: Context) => {
        try {
            if (!localStorage.getItem("context")){
                let init_context = {
                    "LRU": hash,
                    "MRU": hash,
                }
                init_context[hash] = {
                    "data": data ? data : context,
                    "next": ""
                }
                localStorage.setItem("context", JSON.stringify(init_context))
            } else {
                let contexts = JSON.parse(localStorage.getItem("context"));
                contexts[contexts["MRU"]]["next"] = hash;
                contexts[hash] = {
                    "data": data ? data : context,
                    "next": ""
                }
                contexts["MRU"] = hash;
                while (Object.keys(contexts).length > MAX_LOCALSTORAGE_CONTEXTS){
                    let lru = contexts["LRU"]
                    contexts["LRU"] = contexts[lru]["next"]
                    delete contexts[lru]
                }
                localStorage.setItem("context", JSON.stringify(contexts))
            }
        } catch (e){
            localStorage.clear();
            saveContextHash(hash, data)
        }
    }

    const initContextFromUrl = () => {
        let initContext: Context = {}
        try {
            let hash = window.location.hash.substring(1);
            initContext = JSON.parse(localStorage.getItem("context"))[hash]["data"]
        } catch (e) {}
        context.value = {...initContext, ...context.value}
    }

    return {
        handleRedirect,
        getContextHash,
        saveContextHash,
        initContextFromUrl,
        context,
    }
}