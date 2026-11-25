<template>
    <div class="image-thumbnail">
        <masonry-wall :items="thumbnailUrls" :column-width="256" :gap="10">
            <template #default="{ item }">
                <div>
                    <img :id="item" @click="showZoomedImage(item)" class="img-thumbnail" :src="item" />
                </div>
            </template>
        </masonry-wall>
        <!-- a click outside the dialog closes it, like a Bootstrap modal; only when the press started there too
             (a drag in the image released outside the dialog also fires its click on the modal) -->
        <div v-if="zoomImage != null" id="zoomWindow" class="modal fade" :class="{'show': zoomImage}" tabindex="-1" style="display: block" aria-hidden="true"
             @pointerdown.capture="pressedOutside = $event.target === $event.currentTarget"
             @click.self="pressedOutside && closeZoomedImage()">
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
                    <div class="modal-body image-zoom__body">
                        <div class="row gx-3 gy-3 gy-lg-0 image-zoom__row">
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
        <div v-if="zoomImage != null" class="modal-backdrop fade show"></div>
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
            pressedOutside: false,
            // the viewer fills the modal body (see .image-zoom__row)
            viewerHeight: '100%',
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
            this.pressedOutside = false
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
    width: 95vw;
    max-width: 95vw;
    height: 95vh;
    margin: 2.5vh auto;

    .modal-content {
        height: 100%;
    }
}

// the body takes the height left under the header; the image (and the text pane next to it) fill it
.image-zoom__body {
    min-height: 0;
    overflow-y: auto;
}

// below lg the text pane stacks under the image, each as high as the body: the body scrolls to the text
.image-zoom__row {
    height: 100%;

    > * {
        height: 100%;
    }
}
</style>
