<template>
    <tr class="tree-row">
        <template v-for="depth in row_data.depth">
            <tree-line :direction="row_data.lines[depth - 1]"></tree-line>
        </template>
        
        <td v-if="has_children === true" :class="expand_children_classes" @click="toggleExpandChildren">
            <font-awesome-icon :icon="expand_children_icon" :pulse="is_loading_children" size="lg"></font-awesome-icon>
        </td>
        <tree-line v-else direction="straight-horizontal"></tree-line>
        
        <td v-if="has_subtree === true" :class="expand_subtree_classes" @click="toggleExpandSubtree">
            <font-awesome-icon :icon="expand_subtree_icon" :pulse="is_loading_subtree" size="lg"></font-awesome-icon>
        </td>
        <td v-else>
            <font-awesome-icon class="has-text-grey-lighter" icon="angle-down" size="lg"></font-awesome-icon>
        </td>
        
        <td :colspan="details_span">
            <p
                v-for="(detail, index) in row_data.details"
                :key="index"
                :class="detailClasses(index)"
            >{{detail}}</p>
            
            <div class="tag is-danger" v-if="has_error === true">
                <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
                {{ error_message }}
            </div>
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
            <td v-for="(group, index) in groups" :key="index" class="has-text-centered">
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
    import axios from 'axios';
    import NodeProcessing from "../../mixins/methods/NodeProcessing.js";
    import groups from "../../mixins/props/groups.js";
    import columns from "../../mixins/props/columns.js";
    import traverse_down_url from "../../mixins/props/traverse_down_url.js";
    import subtree_url from "../../mixins/props/subtree_url.js";
    import is_grouped from "../../mixins/props/is_grouped";
    import is_percented from "../../mixins/props/is_percented";
    
    export default {
        name: 'tree-row',
        components: {
            TreeLine,
            FontAwesomeIcon
        },
        
        mixins: [
            columns,
            groups,
            is_grouped,
            is_percented,
            subtree_url,
            traverse_down_url,
            NodeProcessing
        ],
        
        data: function ()
        {
            return {
                is_loading_subtree: false,
                is_loading_children: false,
                
                error_message: null
            };
        },
        
        props: {
            row_data: {
                type: Object,
                required: true,
                validator: objectHasKeys([
                    'parent',
                    
                    'id',
                    'details',
                    'values',
                    'groups',
                    'percentages',
                    
                    'children',
                    'subtree',
                    
                    'depth',
                    'levels',
                    'lines'
                ])
            },

            tree_width: {
                type: Number,
                required: true
            },
            
            subtree_is_enabled: {
                type: Boolean,
                default: false
            }
        },
        
        computed: {
            traverse_down_is_enabled: function ()
            {
                return this.traverse_down_url !== null;
            },
            has_children: function ()
            {
                if (
                    this.row_data.children.loaded === false
                    && this.row_data.children.available === true
                    && this.traverse_down_is_enabled === true
                ) {
                    return true;
                }
                
                if (this.row_data.children.contents.length > 0) {
                    return true;
                }
                
                return false;
            },
            has_subtree: function ()
            {
                if (
                    this.row_data.subtree.loaded === false
                    && this.row_data.subtree.available === true
                    && this.subtree_is_enabled === true
                ) {
                    return true;
                }
                
                if (this.row_data.subtree.contents.length > 0) {
                    return true;
                }
                
                return false;
            },
            has_error: function ()
            {
                return this.error_message !== null;
            },

            /**
             * How much space remains on the right-hand side after controls and details
             * Width of tree - current depth - ??? self ???
             */
            details_span: function()
            {
                let span = this.tree_width - this.row_data.depth - 2;
                
                return span;
            },
            
            expand_children_classes: function ()
            {
                if (this.has_children === true) {
                    return 'has-tree-button has-text-primary is-interactive';
                }
                
                return '';
            },
            expand_children_icon: function ()
            {
                if (this.is_loading_children === true) {
                    return 'spinner';
                }
                
                if (this.row_data.children.expanded === true) {
                    return 'minus';
                }
                
                return 'plus';
            },
            
            expand_subtree_classes: function ()
            {
                let classes = [
                    'is-narrow',
                    'has-text-primary',
                    'is-interactive'
                ];
                
                if (this.row_data.subtree.expanded === true) {
                    classes.push('expanded');
                }
                
                return classes;
            },
            expand_subtree_icon: function ()
            {
                if (this.is_loading_subtree === true) {
                    return 'spinner';
                }

                if (this.row_data.subtree.expanded === true) {
                    return 'angle-up';
                }

                return 'angle-down';
            }
        },
        
        methods: {
            detailClasses: function (index)
            {
                if (index === 0) {
                    return 'has-text-weight-bold';
                }

                return 'is-size-7 has-text-grey';
            },
            
            toggleExpandChildren: function ()
            {
                if (this.is_loading_children === true) {
                    return;
                }
                
                if (this.row_data.children.available === true && this.row_data.children.loaded === false) {
                    this.loadChildren();
                } else {
                    this.row_data.children.expanded = !this.row_data.children.expanded;
                }
            },
            loadChildren: function ()
            {
                let url = this.traverse_down_url.replace('%id', this.row_data.id);
                
                this.is_loading_children = true;
                this.clearErrorMessage();
                
                axios.get(url)
                    .then(this.loadChildrenSuccess)
                    .catch(this.loadChildrenFailure)
                    .finally(this.loadChildrenCleanup);
            },
            loadChildrenSuccess: function (response)
            {
                for (let index in response.data) {
                    this.children.contents.push(
                        this.createTreeNode(response.data[index], this.row_data.depth)
                    );
                }
                
                this.row_data.children.loaded = true;
                this.row_data.children.expanded = true;
            },
            loadChildrenFailure: function ()
            {
                this.setErrorMessage('Unable to load children for this row; please try again');
                this.row_data.expanded = false;
            },
            loadChildrenCleanup: function ()
            {
                this.is_loading_children = false;
            },
            
            toggleExpandSubtree: function ()
            {
                if (this.row_data.subtree.loaded === false) {
                    this.loadSubtree();
                } else {
                    this.row_data.subtree.expanded = !this.row_data.subtree.expanded;
                }
            },
            loadSubtree: function ()
            {
                let url = this.subtree_url.replace('%id', this.row_data.id);
                
                this.is_loading_subtree = true;
                this.clearErrorMessage();

                axios.get(url)
                    .then(this.loadSubtreeSuccess)
                    .catch(this.loadSubtreeFailure)
                    .finally(this.loadSubtreeCleanup);
            },
            loadSubtreeSuccess: function (response)
            {
                for (let index in response.data) {
                    this.row_data.subtree.contents.push(
                        this.createSubtreeRow(response.data[index], this.row_data)
                    );
                }
                
                this.row_data.subtree = response.data;
                this.row_data.subtree.loaded = true;
                this.row_data.subtree.expanded = true;
            },
            loadSubtreeFailure: function ()
            {
                this.setErrorMessage('Unable to load subtree for this row; please try again');
                this.row_data.subtree.expanded = false;
            },
            loadSubtreeCleanup: function ()
            {
                this.is_loading_subtree = false;
            },
            
            clearErrorMessage: function ()
            {
                this.error_message = null;
            },
            setErrorMessage: function(message)
            {
                this.error_message = message;
            }
        }
    }
</script>
