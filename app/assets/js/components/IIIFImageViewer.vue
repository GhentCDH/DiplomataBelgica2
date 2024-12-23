<!-- <template>
    <div>
      <div style="width: 100%; height: 800px" id="viewer-image" ref="image" />
    </div>
  </template>

<script>

import 'tify'
import 'tify/dist/tify.css'
// window.tify = tify;

export default {
    name: "Viewer",
    data() {
        return {
        viewer: null,
        };
    },
    mounted() {
        this.initViewer();
    },   
    props: {
        manifestUrl: {
            type: String,
            default: 'https://iiif.ghentcdh.ugent.be/iiif/images/dibe:images:06151/info.json'
        },
    },

    methods: {
        initViewer() {
            console.log("init Viewer");

            this.viewer = new Tify({
                container: '#viewer-image',
                manifestUrl: this.manifestUrl,
            });
        }
    }

}
</script> -->