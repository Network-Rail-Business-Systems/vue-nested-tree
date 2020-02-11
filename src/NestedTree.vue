<template>
    <div class="table-container">
        <div class="level is-mobile">
            <div class="level-left">
                <div class="level-item"><slot name="header-left"></slot></div>
            </div>
            
            <div class="level-right">
                <div v-if="grouping_is_enabled === true" class="level-item">
                    <toggle-button
                        @click="toggleGrouped"
                        :checked.sync="is_grouped"
                        label_on="Grouped"
                        label_off="Ungrouped"
                    ></toggle-button>
                </div>
                
                <div v-if="percenting_is_enabled === true" class="level-item">
                    <toggle-button
                        @click="togglePercented"
                        :checked.sync="is_percented"
                        label="Percentages"
                    ></toggle-button>
                </div>
                
                <div v-if="show_download_button === true" class="level-item">
                    <a :href="processed_download_url" target="_blank">
                        <font-awesome-icon icon="download" title="Download"></font-awesome-icon>
                    </a>
                </div>
                
                <slot name="header-right"></slot>
            </div>
        </div>
        
        <table class="table is-striped nested-tree">
            <thead>
                <tr>
                    <th v-if="upward_traversal_is_enabled === true" class="is-narrow">
                        <font-awesome-icon icon="angle-double-up"  title="Go Up One level" size="lg"></font-awesome-icon>
                    </th>
                    
                    <th :colspan="title_span">{{title}}</th>
                    
                    <template v-if="is_grouped === false"> 
                        <th
                            v-for="(column, index) in columns"
                            :key="index"
                            class="is-narrow has-text-centered"
                        >
                            <font-awesome-icon :icon="column.icon" :title="column.name"></font-awesome-icon>
                        </th>
                    </template><template v-else>
                        <th
                            v-for="(group, index) in groups"
                            :key="index"
                            class="is-narrow has-text-centered"
                        >
                            <font-awesome-icon :icon="group.icon" :title="group.name"></font-awesome-icon>
                        </th>
                    </template>
                </tr>
            </thead>
            
            <tbody>
                <tr v-if="is_processing === true">
                    <td :colspan="table_width" class="has-text-centered notification is-grey has-text-grey has-text-weight-bold">
                        <font-awesome-icon icon="spinner" pulse class="inline-icon"></font-awesome-icon>
                        Processing Tree...
                    </td>
                </tr>
                
                <tr v-else-if="tree_is_empty === true">
                    <td :colspan="table_width" class="has-text-centered notification is-grey has-text-grey has-text-weight-bold">
                        <font-awesome-icon icon="exclamation-triangle" class="inline-icon"></font-awesome-icon>
                        No Tree to Show
                    </td>
                </tr>
                
                <template v-else v-for="row in displayed_tree">
                    <subtree-row
                        v-if="row.type === 'subtree'"
                        :key="row.id"
                        :row_data="row"
                        :columns="columns"
                        :groups="groups"
                        :tree_width="details_width"
                        :is_grouped="is_grouped"
                        :is_percented="is_percented"
                    ></subtree-row>
                    
                    <tree-row
                        v-else
                        :key="row.id"
                        :row_data="row"
                        :columns="columns"
                        :groups="groups"
                        :tree_width="details_width"
                        :is_grouped="is_grouped"
                        :is_percented="is_percented"
                        :percentage_of="percentage_of"
                        :subtree_url="subtree_url"
                        :traverse_down_url="traverse_down_url"
                    ></tree-row>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script>
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
    import TreeRow from './components/TreeRow/TreeRow.vue';
    import {isNotBlank} from './mixins/FoxValidators.js';
    import ToggleButton from './components/ToggleButton/ToggleButton.vue';
    import SubtreeRow from './components/SubtreeRow/SubtreeRow';
    import NodeProcessing from "./mixins/methods/NodeProcessing";
    import columns from "./mixins/props/columns.js";
    import groups from "./mixins/props/groups.js";
    import traverse_down_url from "./mixins/props/traverse_down_url";
    import subtree_url from "./mixins/props/subtree_url";
    import grouping_is_enabled from "./mixins/computed/grouping_is_enabled";
    import subtree_is_enabled from "./mixins/computed/subtree_is_enabled";
    import percenting_is_enabled from "./mixins/computed/percenting_is_enabled";
    import percentage_of from "./mixins/props/percentage_of";

    export default {
        name: 'nested-tree',
        components: {
            FontAwesomeIcon,
            TreeRow,
            ToggleButton,
            SubtreeRow
        },
        
        mixins: [
            columns,
            groups,
            grouping_is_enabled,
            percentage_of,
            percenting_is_enabled,
            subtree_url,
            subtree_is_enabled,
            traverse_down_url,
            NodeProcessing
        ],
        
        data: function ()
        {
            return {
                processed_tree: [],
                is_processing: false,
                is_grouped: this.start_grouped,
                is_percented: this.start_percented
            }
        },
        
        props: {
            download_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            
            start_grouped: {
                type: Boolean,
                default: false
            },
            
            start_percented: {
                type: Boolean,
                default: false
            },
            
            title: {
                type: String,
                required: true,
                validator: isNotBlank()
            },
            
            traverse_up_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            
            tree: {
                type: Array,
                required: true
            }
        },
        
        computed: {
            displayed_tree: function ()
            {
                let displayedTree = [];
                
                for (let index in this.processed_tree) {
                    let visibleNodes = this.filterVisibleNodes(this.processed_tree[index]);
                    if (visibleNodes !== false) {
                        displayedTree = displayedTree.concat(visibleNodes);
                    }
                }
                
                return displayedTree;
            },
            tree_is_empty: function ()
            {
                return this.displayed_tree.length < 1;
            },
            
            table_width: function ()
            {
                return this.details_width + this.values_width;
            },
            title_span: function ()
            {
                let width = this.details_width;
                
                if (this.upward_traversal_is_enabled === true) {
                    width--;
                }
                
                return width;
            },
            details_width: function ()
            {
                let width = 0;

                for (let index in this.processed_tree) {
                    if (this.processed_tree[index].levels > width) {
                        width = this.processed_tree[index].levels;
                    }
                }
                
                // +1 width for base level and for expand button
                width += 2;
                
                if (this.subtree_is_enabled === true) {
                    width++;
                }
                
                return width;
            },
            values_width: function ()
            {
                if (this.is_grouped === true) {
                    return this.groups.length;
                }

                return this.columns.length;
            },
            
            upward_traversal_is_enabled: function ()
            {
                return this.traverse_up_url !== null;
            },
            
            show_download_button: function ()
            {
                if (this.tree_is_empty === true) {
                    return false;
                }
                
                return this.download_url !== null;
            },
            processed_download_url: function ()
            {
                if (this.tree_is_empty === true) {
                    return '';
                }
                
                return this.download_url.replace('%id', this.displayed_tree[0].id);
            },
        },
        
        methods: {
            /**
             * Creates a tree based on the source data that includes visibility, grouping, and percentage data
             * @param sourceTree Array The source tree dataset
             * @return Array The processed tree dataset
             */
            createProcessedTree: function (sourceTree)
            {
                let processedTree = [];
                
                this.is_processing = true;
                
                for (let index in sourceTree) {
                    processedTree.push(
                        this.processTreeData(sourceTree[index])
                    );
                }
                
                this.is_processing = false;
                return processedTree;
            },
            
            /**
             * Recursively filters a tree node and its children for visible nodes
             * @param treeNode Object The nested tree dataset
             * @param hasSiblingAfter Boolean Whether there a node after this one
             * @return Array|Boolean A flat array of all visible nodes
             */
            filterVisibleNodes: function (treeNode, hasSiblingAfter = false)
            {
                let visibleNodes = [];
                
                if (this.nodeIsVisible(treeNode) === false) {
                    return false;
                }
                
                this.calculatePassthroughLines(treeNode, hasSiblingAfter);
                visibleNodes.push(treeNode);
                
                // Output subtree nodes
                if (treeNode.subtree.expanded === true) {
                    for (let index in treeNode.subtree.contents) {
                        let subtreeNode = treeNode.subtree.contents[index];
                        let hasSibling = parseInt(index) !== treeNode.subtree.contents.length - 1;
                        this.calculatePassthroughLines(subtreeNode, hasSibling, true);
                        visibleNodes.push(subtreeNode);
                    }
                }
                
                for (let index in treeNode.children.contents) {
                    let siblingAfter = parseInt(index) !== treeNode.children.contents.length - 1;
                    let child = this.filterVisibleNodes(treeNode.children.contents[index], siblingAfter);
                    if (child !== false) {
                        visibleNodes = visibleNodes.concat(child);
                    }
                }
                
                return visibleNodes; 
            },
            
            /**
             * Determines where to place passthrough lines for tree visualisation
             * @param node Object A tree node
             * @param hasSiblingAfter Boolean Whether there is a node after this one
             * @param isSubtree Boolean Whether this is a subtree node
             */
            calculatePassthroughLines: function (node, hasSiblingAfter = false, isSubtree = false)
            {
                let line;
                let armIndex = node.depth - 1;
                
                if (node.parent !== null) {
                    for (let index in node.parent.lines) {
                        switch (node.parent.lines[index]) {
                            case 'tee-right':
                            case 'straight-vertical':
                                node.lines[index] = 'straight-vertical';
                                break;

                            default:
                                node.lines[index] = 'none';
                        }
                    }

                    if (isSubtree === true) {
                        node.lines[armIndex] = 'none';
                        armIndex++;
                    }
                    
                    if (hasSiblingAfter === true) {
                        line = 'tee-right';
                    } else {
                        line = 'elbow-up-right';
                    }

                    node.lines[armIndex] = line;
                }
            },
            
            /**
             * Determine whether or not a tree node should be visible
             * @param treeNode Object The node to test
             * @return Boolean
             */
            nodeIsVisible: function (treeNode)
            {
                if (treeNode.parent === null) {
                    return true;
                }
                
                if (treeNode.parent.children.expanded === true) {
                    return true;
                }
                
                return false;
            },
            
            togglePercented: function ()
            {
                this.is_percented = !this.is_percented;
            },
            
            toggleGrouped: function ()
            {
                this.is_grouped = !this.is_grouped;
            }
        },
        
        mounted: function ()
        {
            this.processed_tree = this.createProcessedTree(this.tree);
        },
        
        watch: {
            tree: function ()
            {
                this.processed_tree = this.createProcessedTree(this.tree);
            }
        }
    }
</script>
