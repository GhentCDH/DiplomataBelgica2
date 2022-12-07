<template>
    <div class="imagethumbnail">
        <template v-if="outputValues && outputValues.length">
            <img class="img-thumbnail" v-for="(item, index) in outputValues" :key="index" :src="item" />
        </template>
    </div>
</template>
<script>

export default {
    name: "ImageThumbnail",
    props: {
        url: {
            type: Array,
        },
        unknown: {
            type: String,
            default: null
        },
    },
    
    computed: {
        outputValues() {
            let urls = this.url ? ( Array.isArray(this.url) ? this.url : [ this.url ] ) : ( this.unknown ? [ this.unknown ] : [] )
            return urls
        },
    },
}
</script>