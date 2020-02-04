<template>
    <label class="toggle-button">
        <div v-if="has_label === true">{{ label_text }}</div>
        <input v-model="is_checked" type="checkbox" />
        <span></span>
    </label>
</template>

<script>
    export default {
        data: function ()
        {
            return {
                is_checked: this.checked
            }
        },
        
        props: {
            checked: {
                type: Boolean,
                default: false
            },
            label: {
                type: String,
                default: ""
            },
            label_on: {
                type: String,
                default: ""
            },
            label_off: {
                type: String,
                default: ""
            }
        },
        
        computed: {
            has_label: function ()
            {
                return this.label !== "" || this.label_on !== "" || this.label_off !== "";
            },
            label_text: function ()
            {
                if (this.label_off !== "" && this.is_checked === false) {
                    return this.label_off;
                }
                
                if (this.label_on !== "" && this.is_checked === true) {
                    return this.label_on;
                }
                
                return this.label;
            }
        },
        
        watch: {
            is_checked: function ()
            {
                this.$emit('update:checked', this.is_checked)
            }
        }
    }
</script>
