<template>
    <span v-if="value != null">
        <template v-if="value.text">
          <a v-if="value.url" :href="value.url">{{ formatValue(value.text) }}</a>
          <template v-else>{{ formatValue(value.text) }}</template>
        </template>
        <template v-else>
          <a v-if="url" :href="url">{{ formatValue(value) }}</a>
          <template v-else>{{ formatValue(value) }}</template>
        </template>
        <template v-if="value.urls">
          <a v-for="(item, index) in value.urls" :href="item" class="external-link">Link</a>
        </template>
    </span>
    <span v-else>
        {{ unknown }}
    </span>
</template>

<script>
export default {
    name: "FormatValue",
    props: {
        value: {
            type: String|Number|Object
        },
        unknown: {
            type: String,
            default: 'unknown'
        },
        url: {
            type: String,
        },
        type: {
            type: String,
        }
    },
    methods: {
        formatValue(value) {
            if ( !value ) {
                return this.unknown
            }

            switch (this.type) {
                case 'range':
                    if ( value ) {
                        return (value.start === value.end ? value.start : value.start + ' - ' + value.end)
                    }

                    break;
                case 'id_name':

                    return value.name;
                    break;

                default:
                    return value
            }

            return this.unknown;
        }
    }
}
</script>

<style scoped lang="scss">
.external-link {
  margin-left: 5px;
}
</style>
