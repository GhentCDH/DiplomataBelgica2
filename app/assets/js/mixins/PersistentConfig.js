import merge from 'lodash.merge';

export default function(cookieName) {
    return {
        data() {
            return {
                configCookieName: cookieName,
                config: {},
            }
        },
        watch: {
            config: {
                handler: function (newConfig, oldConfig) {
                    this.setCookie(this.configCookieName, newConfig)
                    this.$emit('config-changed', newConfig)
                },
                deep: true
            },
        },
        methods: {
            setCookie(name, value) {
                this.$cookies.set(name,value,'30d')
            },
            getCookie(name, defaultValue) {
                try {
                    let ret
                    ret = this.$cookies.get(name)
                    if (typeof ret === 'object' && ret !== null) {
                        ret = merge({}, defaultValue, ret)
                        return ret
                    }
                } catch(error) {
                    return defaultValue
                }
                return defaultValue;
            },
        },
        mounted() {
        },
        created() {
            this.config = this.defaultConfig;
            if ( !this.$cookies.isKey(this.configCookieName) )
                this.setCookie(this.configCookieName, this.config)
            else {
                this.config = this.getCookie(this.configCookieName,this.defaultConfig)
            }
        }
    }
}
