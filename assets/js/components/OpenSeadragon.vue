<template>
    <div
      :id="id"
      class="openseadragon" style="height: 500px"
    />
  </template>
  <script>

let openseadragon = require('openseadragon')
  
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
    },
    data () {
      return {
        viewer: null
      }
    },

    mounted () {
      this.openseadragon()
    //   this.addHandlers()
    },
    methods: {

      openseadragon () {
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
              tileSources: this.IIIFImageUrl
            })
          }
        }
      },
    }
  }
  </script>
  