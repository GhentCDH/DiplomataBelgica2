<template>
    <div class="image-thumbnail">
        <masonry-wall :items="thumbnailUrls" :column-width="256" :gap="10">
            <template #default="{ item }">
                <div>
                    <img @click="showZoomedImage(item)" class="img-thumbnail" :src="item" />
                </div>
            </template>
        </masonry-wall>
        <div v-if="zoomImage != null" id="zoomWindow" class="modal fade" :class="{'show': zoomImage}" tabindex="-1" style="display: block" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Image Zoom</h5>
                        <button type="button" class="btn-close" @click="closeZoomedImage" aria-label="Close">
                            <!-- <span aria-hidden="true">&times;</span> -->
                        </button>
                    </div>
                    <div class="modal-body">
                        <open-seadragon
                            id="openseadragon-zoom-viewer"
                            :IIIFImageUrl="zoomImage"
                            :height="imageHeight"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MasonryWall from '@yeger/vue2-masonry-wall';
import OpenSeadragon from './OpenSeadragon.vue';

export default {
    name: "ImageThumbnail",
    components: {
        MasonryWall,
        OpenSeadragon
    },
    data() {
        return {
            NotClicked : true ,
            zoomImage : null,
            items: [],
            imageHeight : 266,
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
    },

    methods: {
        showZoomedImage (item) {	
            this.zoomImage = item.replace('/full/256,/0/default.jpg', '/info.json')
            const element = document.getElementById('zoomWindow');
            // element.style.display='block';
            // this.imageHeight = 
        },
        closeZoomedImage () {
            const element = document.getElementById('zoomWindow');
            // element.style.display='none';
            this.zoomImage = null;
        }
    }
}
</script>