<template>
    <div class="image-thumbnail">
        <masonry-wall :items="thumbnailUrls" :column-width="256" :gap="10">
            <template #default="{ item }">
                <div>
                    <img :id="item" @click="showZoomedImage(item)" class="img-thumbnail" :src="item" />
                </div>
            </template>
        </masonry-wall>
        <div v-if="zoomImage != null" id="zoomWindow" class="modal fade" :class="{'show': zoomImage}" tabindex="-1" style="display: block" aria-hidden="true">
            <div class="modal-dialog modal-xl image-zoom__dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $t('label.imageZoom') }}</h5>
                        <div v-if="text" class="form-check form-switch ms-auto me-3 mb-0">
                            <input id="image-zoom-show-text" class="form-check-input" type="checkbox" role="switch" v-model="showText">
                            <label class="form-check-label" for="image-zoom-show-text">{{ $t('label.showText') }}</label>
                        </div>
                        <button type="button" class="btn-close" :class="{'ms-0': text}" @click="closeZoomedImage" :aria-label="$t('label.close')">
                            <!-- <span aria-hidden="true">&times;</span> -->
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div :class="showTextPane ? 'col-lg-7' : 'col-12'">
                                <open-seadragon
                                    id="openseadragon-zoom-viewer"
                                    :IIIFImageUrl="zoomImage"
                                    :height="viewerHeight"
                                />
                            </div>
                            <div v-if="showTextPane" class="col-lg-5">
                                <div class="image-zoom__text charter-full-text overflow-auto" :style="{height: viewerHeight}" v-html="text"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MasonryWall from '@yeger/vue-masonry-wall';
import OpenSeadragon from './OpenSeadragon.vue';

export default {
    name: "ImageThumbnail",
    components: {
        MasonryWall,
        OpenSeadragon
    },
    data() {
        return {
            zoomImage : null,
            showText: true,
            viewerHeight: '70vh',
        }
    },

    props: {
        thumbnailUrls: {
            type: Array,
            default: () => []
        },
        unknown: {
            type: String,
            default: null
        },
        // html shown next to the zoomed image (e.g. the full text of a charter)
        text: {
            type: String,
            default: null
        },
    },

    computed: {
        showTextPane() {
            return !!this.text && this.showText
        }
    },

    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown)
    },

    methods: {
        showZoomedImage (item) {
            this.zoomImage = item.replace('/full/256,/0/default.jpg', '/info.json')
            document.addEventListener('keydown', this.onKeydown)
        },
        closeZoomedImage () {
            this.zoomImage = null;
            document.removeEventListener('keydown', this.onKeydown)
        },
        onKeydown (event) {
            if (event.key === 'Escape') {
                this.closeZoomedImage()
            }
        }
    }
}
</script>

<style scoped lang="scss">
.image-zoom__dialog {
    max-width: min(95vw, 1600px);
}
</style>
