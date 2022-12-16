// export const FIELDS = {
//     type: {
//       label: 'Type',
//       type: 'dropdown-single'
//     },
//     context_number: {
//       label: 'Context number or label',
//       type: 'autocomplete'
//     },
//     inventory_number: {
//       label: 'Inventory number',
//       type: 'autocomplete'
//     },
//     square: {
//       label: 'Square',
//       type: 'autocomplete'
//     },
//     spatial_description_0: {
//       label: 'Spatial description level 1',
//       type: 'nested'
//     },
//     spatial_description_1: {
//       label: 'Spatial description level 2',
//       type: 'nested'
//     },
//     spatial_description_2: {
//       label: 'Spatial description level 3',
//       type: 'nested'
//     },
//     all: {
//       label: 'Search all fields',
//       type: 'input'
//     }
//   }
//   export const SEARCHEABLE = [
//     'type',
//     'context_number',
//     'inventory_number',
//     'square',
//     'spatial_description_0',
//     'spatial_description_1',
//     'spatial_description_2'
//   ]
//   export const NESTED_FIELDS = [
//     'spatial_description_0',
//     'spatial_description_1',
//     'spatial_description_2'
//   ]
  
//   export function isArray (variable) {
//     return Array.isArray(variable)
//   }
  
//   export function isObject (variable) {
//     return variable != null && typeof variable === 'object'
//   }
  
//   export function getIIIFBase (relativeUrl) {
//     const reSlash = /[/]/g
//     const reUnwanted = /[^a-zA-Z0-9_\-:]/g
//     const escapedUrl = relativeUrl
//       .split('.').slice(0, -1).join('.') // remove extension
//       .replace(reSlash, ':') // replace path
//       .replace(reUnwanted, '_') // escape unwanted characters
//     return `https://iiif.ghentcdh.ugent.be/iiif/images/dibe:images:${escapedUrl}`
//   }
  
//   export function getIIIFThumbnail (relativeUrl, sizes, width) {
//     // Find IIIF suggested image size that is slightly larger than the requested size
//     let sizeWidth = width
//     for (const size of sizes) {
//       if (size.width > width) {
//         sizeWidth = size.width
//         break
//       }
//     }
//     return `${getIIIFBase(relativeUrl)}/full/${sizeWidth},/0/default.jpg`
//   }
  
//   export function getIIIFSrcSet (relativeUrl, sizes, widths) {
//     return widths
//       .map(width => `${getIIIFThumbnail(relativeUrl, sizes, width)} ${width}w`)
//       .join(', ')
//   }
  
//   export async function getIIIFImageSizes (axios, images) {
//     const imageSizes = {}
//     const responses = await Promise.allSettled(
//       images.map(image => axios.get(`${getIIIFBase(image)}/info.json`))
//     )
//     for (const [index, image] of images.entries()) {
//       if (responses[index].status === 'fulfilled') {
//         imageSizes[image] = responses[index].value.data.sizes
//       }
//     }
//     return imageSizes
//   }
  
//   export async function getIIIFTileSources (axios, image) {
//     return (await axios.get(`${getIIIFBase(image)}/info.json`)).data
//   }
  
