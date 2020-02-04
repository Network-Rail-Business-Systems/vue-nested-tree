<template>
    <div class="table-container">
        <div class="level is-mobile">
            <div class="level-left">
                <div class="level-item">Filter</div>
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
                            class="is-narrow"
                        >
                            <font-awesome-icon :icon="column.icon" :title="column.name"></font-awesome-icon>
                        </th>
                    </template><template v-else>
                        <th
                            v-for="(group, index) in groups"
                            :key="index"
                            class="is-narrow"
                        >
                            <font-awesome-icon :icon="group.icon" :title="group.name"></font-awesome-icon>
                        </th>
                    </template>
                </tr>
            </thead>
            
            <tbody>
                <tr v-if="is_processing === true">
                    <td :colspan="table_width">Processing...</td>
                </tr>
                
                <tr v-else-if="tree_is_empty === true">
                    <td :colspan="table_width">The tree is empty</td>
                </tr>
                
                <tree-row
                    v-else
                    v-for="row in displayed_tree"
                    :key="row.id"
                    :row_data="row"
                    :columns="columns"
                    :groups="groups"
                    :tree_width="details_width"
                    :is_grouped="is_grouped"
                    :is_percented="is_percented"
                    :subtree_is_enabled="subtree_is_enabled"
                ></tree-row>
            </tbody>
        </table>
    </div>
</template>

<script>
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
    import TreeRow from './components/TreeRow/TreeRow.vue';
    import {isNotBlank, objectsHaveKeys} from './mixins/FoxValidators.js';
    import ToggleButton from './components/ToggleButton/ToggleButton.vue';

    export default {
        name: 'nested-tree',
        components: {
            FontAwesomeIcon,
            TreeRow,
            ToggleButton
        },
        
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
            columns: {
                type: Array,
                required: true,
                validator: objectsHaveKeys([
                    'name',
                    'icon'
                ])
            },
            
            download_url: {
                type: String,
                default: null,
                validator: isNotBlank()
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
            
            percentage_of: {
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
            
            subtree_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            
            title: {
                type: String,
                required: true,
                validator: isNotBlank()
            },
            
            traverse_downward_url: {
                type: String,
                default: null,
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

            grouping_is_enabled: function ()
            {
                return this.groups.length > 0;
            },
            percenting_is_enabled: function ()
            {
                return this.percentage_of !== null;
            },
            upward_traversal_is_enabled: function ()
            {
                return this.traverse_up_url !== null;
            },
            subtree_is_enabled: function ()
            {
                return this.subtree_url !== null;
            }
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
                    processedTree.push(this.processTreeData(sourceTree[index]));
                }
                
                this.is_processing = false;
                return processedTree;
            },
            
            /**
             * Recursively creates tree nodes from a source tree
             * @param sourceData Object The raw tree
             * @param depth Number How deep the node is
             * @return Object The processed tree
             */
            processTreeData: function (sourceData, depth = 0) {
                let treeNode = this.createTreeNode(sourceData, depth);

                if (typeof sourceData.children !== 'undefined' && sourceData.children.length > 0) {
                    for (let index in sourceData.children) {
                        let childNode = this.processTreeData(sourceData.children[index], depth + 1);
                        childNode.parent = treeNode;
                        treeNode.children.push(childNode);
                        
                        if (treeNode.levels < childNode.levels + 1) {
                            treeNode.levels = childNode.levels + 1;
                        }
                    }
                }
                
                return treeNode;
            },

            /**
             * Turns an input tree node into a processed tree node with groups and percentages
             * @param sourceData Object The raw data from the input tree
             * @param depth Number How deep the node is
             * @returns Object The processed tree node with added fields
             */
            createTreeNode: function (sourceData, depth)
            {
                let expanded = false;
                let groups = this.groupData(sourceData.data);
                
                if (depth === 0) {
                    expanded = true;
                }
                
                return {
                    id: sourceData.id,
                    details: sourceData.details,
                    children: [],
                    
                    values: sourceData.data,
                    groups: groups,
                    percentages: this.percentData(sourceData.data, groups),
                    
                    expanded: expanded,
                    parent: null,
                    depth: depth,
                    levels: 0,
                    lines: []
                }
            },
            
            /**
             * Creates summed groups based on the groups settings
             * @param data Object The data to replicate
             * @return Object The grouped data
             */
            groupData: function (data)
            {
                let groupedData = {};
                
                if (this.grouping_is_enabled === false) {
                    return groupedData;
                }
                
                for (let group in this.groups) {
                    group = this.groups[group];
                    groupedData[group.field] = 0;
                    
                    for (let index in group.fields) {
                        groupedData[group.field] += data[group.fields[index]];
                    }
                }
                
                return groupedData;
            },
            
            /**
             * Creates percentages based on the column specified in percentage_of
             * @param ungroupedData Object The data to replicate
             * @param groupedData Object The grouped data to replicate
             * @return Object Percentage values in the same format as data
             */
            percentData: function (ungroupedData, groupedData)
            {
                let percents = {
                    values: {},
                    groups: {}
                };
                
                if (this.percenting_is_enabled === false) {
                    return percents;
                }

                let total = ungroupedData[this.percentage_of];
                
                percents.values = this.percentValues(ungroupedData, this.columns, total);
                
                if (this.grouping_is_enabled === true) {
                    percents.groups = this.percentValues(groupedData, this.groups, total);
                }
                
                return percents;
            },
            
            /**
             * Creates percentages for the given tree node data
             * @param data Object The tree node data
             * @param columns Array The columns to calculate against
             * @param total Number The total to create a percentage of
             * @return Object Percentages in the same format as the source data
             */
            percentValues: function (data, columns, total)
            {
                let values = {};
                let value;
                
                for (let column in columns) {
                    column = columns[column];

                    if (column.field === this.percentage_of) {
                        value = data[column.field];
                    } else if (typeof column.percent !== 'undefined' && column.percent === false) {
                        value = data[column.field];
                    } else {
                        value = (data[column.field] / total) * 100 + '%';
                    }

                    values[column.field] = value;
                }
                
                return values;
            },

            /**
             * Recursively filters a tree node and its children for visible nodes
             * @param treeNode Object The nested tree dataset
             * @param hasSiblingAfter Boolean Is there a following node on this level?
             * @return Array|Boolean A flat array of all visible nodes
             */
            filterVisibleNodes: function (treeNode, hasSiblingAfter = false)
            {
                let visibleNodes = [];
                let line;
                
                if (this.nodeIsVisible(treeNode) === false) {
                    return false;
                }
                
                if (treeNode.parent !== null) {
                    for (let index in treeNode.parent.lines) {
                        
                        switch (treeNode.parent.lines[index]) {
                            case 'tee-right':
                            case 'straight-vertical':
                                treeNode.lines[index] = 'straight-vertical';
                                break;    

                            default:
                                treeNode.lines[index] = null;
                        }
                    }
                    
                    if (hasSiblingAfter === true) {
                        line = 'tee-right';
                    } else {
                        line = 'elbow-up-right';
                    }
                    
                    treeNode.lines[treeNode.depth - 1] = line;
                }
                
                visibleNodes.push(treeNode);
                
                for (let index in treeNode.children) {
                    let siblingAfter = parseInt(index) !== treeNode.children.length - 1;
                    let child = this.filterVisibleNodes(treeNode.children[index], siblingAfter);
                    if (child !== false) {
                        visibleNodes = visibleNodes.concat(child);
                    }
                }
                
                return visibleNodes; 
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
                
                if (treeNode.parent.expanded === true) {
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
