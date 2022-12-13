<!-- <template>
    <div class="imagethumbnail">
        <template v-if="outputValues && outputValues.length">
            <img class="img-thumbnail" v-for="(item, index) in outputValues" :key="index" :src="item" />
        </template>
    </div>
</template> -->

<template>
    <masonry-wall :items="outputValues" :column-width="256" :gap="10">
      <template #default="{ item }">
        <div >
            <img :src="item" />
        </div>
      </template>
    </masonry-wall>
</template>

<script>
import MasonryWall from '@yeger/vue2-masonry-wall'

export default {
    name: "ImageThumbnail",
    components: {
        MasonryWall
    },
    data() {
        return {
        items: [],
        }
    },

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