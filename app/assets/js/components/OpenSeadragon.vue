<template>
    <div
        :id="id"
        class="openseadragon" :style="calculateHeight"
    />
</template>
<script>

import * as openseadragon from 'openseadragon'

export default {
    props: {
        id: {
            type: String,
            default: 'openseadragon-viewer'
        },
        IIIFImageUrl: {
            type: String,
            required: true
        },
        imageHeight: {
            type: Number,
            default: 266
        },
    },
    data() {
        return {
            viewer: null
        }
    },
    computed: {
        calculateHeight() {
            var Height = (700 * (this.imageHeight / 256));
            return {'height': Height + 'px'}
        }
    },

    mounted() {
        this.openseadragon()
        //   this.addHandlers()
    },
    methods: {

        openseadragon() {
            if (openseadragon != null) {
                if (this.IIIFImageUrl == null) {
                    if (this.viewer != null) {
                        this.viewer.destroy()
                    }
                    this.viewer = null
                } else {
                    this.viewer = openseadragon({
                        id: this.id,
                        prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/',
                        tileSources: this.IIIFImageUrl,
                        maxZoomLevel: 5,
                    })
                }
            }
        },
    }

}
</script>
  