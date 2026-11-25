<template>
    <div
        :id="id"
        class="openseadragon" :style="calculateHeight"
    />
</template>
<script>

import OpenSeadragon from 'openseadragon'

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
        // css height of the viewer
        height: {
            type: String,
            default: '70vh'
        },
    },
    data() {
        return {
            viewer: null
        }
    },
    computed: {
        calculateHeight() {
            return {'height': this.height}
        }
    },

    mounted() {
        this.openseadragon()
        //   this.addHandlers()
    },
    beforeUnmount() {
        this.viewer?.destroy()
        this.viewer = null
    },
    methods: {
        openseadragon() {
            if (!this.IIIFImageUrl) {
                if (this.viewer) {
                    this.viewer.destroy()
                }
                this.viewer = null
                return
            }

            this.viewer = OpenSeadragon({
                id: this.id,
                // the 6.1 default buttons are still PNGs (6.2 draws them as SVG and no longer needs prefixUrl)
                prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@6.1.1/build/openseadragon/images/',
                tileSources: this.IIIFImageUrl,
                // load tiles with CORS (the IIIF server allows any origin): the default WebGL drawer
                // cannot use cross-origin tiles otherwise ("Error creating texture in WebGL")
                crossOriginPolicy: 'Anonymous',
                maxZoomLevel: 5,
            })
        },
    }


}
</script>
  