<template>
    <tr>
        <template v-for="depth in row_data.depth">
            <tree-line :direction="row_data.lines[depth - 1]"></tree-line>
        </template>
        
        <td v-if="has_children === true" :class="expand_classes" @click="toggleExpand">
            <font-awesome-icon :icon="expand_icon" size="lg"></font-awesome-icon>
        </td>
        <tree-line v-else direction="straight-horizontal"></tree-line>
        
        <td v-if="subtree_is_enabled === true" class="is-narrow has-text-primary is-interactive">
            <font-awesome-icon icon="angle-down" size="lg"></font-awesome-icon>
        </td>
        
        <td :colspan="details_span">
            <p
                v-for="(detail, index) in row_data.details"
                :key="index"
                :class="detailClasses(index)"
            >{{detail}}</p>
        </td>
        
        <template v-if="is_grouped === false">
            <td v-for="(column, index) in columns" :key="index">
                <template v-if="is_percented === true">
                    {{ row_data.percentages.values[column.field] }}
                </template><template v-else>
                    {{ row_data.values[column.field] }}
                </template>
            </td>
        </template><template v-else>
            <td v-for="(group, index) in groups" :key="index">
                <template v-if="is_percented === true">
                    {{ row_data.percentages.groups[group.field] }}
                </template><template v-else>
                    {{ row_data.groups[group.field] }}
                </template>
            </td>
        </template>
    </tr>
</template>

<script>
    import {objectHasKeys} from '../../mixins/FoxValidators.js';
    import TreeLine from '../../components/TreeLine/TreeLine.vue';
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
    import {objectsHaveKeys} from "../../mixins/FoxValidators";
    
    export default {
        name: 'tree-row',
        components: {
            TreeLine,
            FontAwesomeIcon
        },
        
        props: {
            row_data: {
                type: Object,
                required: true,
                validator: objectHasKeys([
                    'id',
                    'children',
                    'details',
                    'values',
                    'groups',
                    'percentages',
                    'expanded',
                    'depth'
                ])
            },

            columns: {
                type: Array,
                required: true,
                validator: objectsHaveKeys([
                    'name',
                    'icon'
                ])
            },
            groups: {
                type: Array,
                default: function () { return []; },
                validator: objectsHaveKeys([
                    'name',
                    'icon',
                    'fields'
                ])
            },

            tree_width: {
                type: Number,
                required: true
            },
            is_grouped: {
                type: Boolean,
                default: false
            },
            is_percented: {
                type: Boolean,
                default: false
            },
            subtree_is_enabled: {
                type: Boolean,
                default: false
            }
        },
        
        computed: {
            has_children: function ()
            {
                return this.row_data.children.length > 0;
            },

            /**
             * How much space remains on the right-hand side after controls and details
             */
            details_span: function()
            {
                // Width of tree - current depth - ??? self ???
                let span = this.tree_width - this.row_data.depth - 1;
                
                if (this.subtree_is_enabled === true) {
                    span--;
                }
                
                return span;
            },
            
            expand_classes: function ()
            {
                if (this.has_children === true) {
                    return 'has-tree-button has-text-primary is-interactive';
                }
                
                return '';
            },
            expand_icon: function ()
            {
                if (this.row_data.expanded === false) {
                    return 'plus';
                }
                
                return 'minus';
            }
        },
        
        methods: {
            detailClasses: function (index)
            {
                if (index === 0) {
                    return [
                        'has-text-weight-bold'
                    ];
                    
                }

                return [
                    'is-size-7',
                    'has-text-grey'
                ];
            },
            
            toggleExpand: function ()
            {
                this.row_data.expanded = !this.row_data.expanded;
            }
        }
    }
</script>
