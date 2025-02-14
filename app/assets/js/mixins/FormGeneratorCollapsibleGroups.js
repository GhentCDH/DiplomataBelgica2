export default {
    data() {
        return {
            config: {
                groupIsCollapsed: [],
            },
            defaultConfig: {
                groupIsCollapsed: [],
            }
        }
    },
    methods: {
        onFormGeneratorCollapseGroup(e) {
            const group = e.target.parentElement;
            // get element index
            let index = Array.from(group.parentNode.children).indexOf(group)
            this.config.groupIsCollapsed[index] = this.config.groupIsCollapsed[index] !== undefined ? !this.config.groupIsCollapsed[index] : true
        },
        formGeneratorCollapseGroups(schema) {
            const config = this.config
            schema.groups.forEach(function (group, index) {
                let classes = new Set((group.styleClasses || '').split(' ').filter(c => c.trim()))
                if ( classes.has('collapsible') ) {
                    const collapsed = config.groupIsCollapsed[index] ?? classes.has('collapsed')
                    if (collapsed) {
                        classes.add('collapsed')
                    } else {
                        classes.delete('collapsed')
                    }
                    if (config.groupIsCollapsed[index] === undefined) {
                        config.groupIsCollapsed[index] = collapsed
                    }
                    group.styleClasses = [...classes].join(' ')
                }
            })
        }
    },
    mounted() {
        // make legends clickable
        const collapsableLegends = this.$el.querySelectorAll('.vue-form-generator .collapsible legend');
        collapsableLegends.forEach(legend => legend.onclick = this.onFormGeneratorCollapseGroup);
    },
}
