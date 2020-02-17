<template>
    <div class="table-container">
        <div class="level is-mobile">
            <div class="level-left">
                <div v-if="filter_is_enabled === true" class="level-item">
                    <lookup-item
                        @selected="selectFilter"
                        @cleared="clearFilter"
                        :initial_term="filter_initial_term"
                        :lookup_url="filter_search_url"
                        :placeholder="filter_placeholder"
                    ></lookup-item>
                    
                    <a v-if="related_is_enabled === true" :href="processed_related_url" target="_blank">
                        <font-awesome-icon icon="eye" :title="related_text"></font-awesome-icon>
                    </a>                    
                </div>
                
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
                    <th v-if="upward_traversal_is_enabled === true" class="is-narrow is-interactive has-text-primary" @click="loadParent">
                        <font-awesome-icon
                            :icon="upward_traversal_icon"
                            :pulse="is_loading_parent === true"
                            title="Go Up One level"
                            size="lg"
                        ></font-awesome-icon>
                    </th>
                    
                    <th :colspan="title_span">
                        <div class="tag is-danger" v-if="has_error === true">
                            <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
                            {{ error_message }}
                        </div>
                        
                        {{title}}
                    </th>
                    
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
    import axios from 'axios';
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
    import LookupItem from "./components/LookupItem/LookupItem";

    export default {
        name: 'nested-tree',
        components: {
            LookupItem,
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
                is_percented: this.start_percented,
                is_loading_parent: false,
                error_message: null,
                filter_id: null
            }
        },
        
        props: {
            download_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            
            filter_initial_term: {
                type: String,
                default: ''
            },
            filter_search_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            filter_load_url: {
                type: String,
                default: null,
                validator: isNotBlank()
            },
            filter_placeholder: {
                type: String
            },
            
            related_url: {
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
            upward_traversal_icon: function ()
            {
                if (this.is_loading_parent === true) {
                    return 'spinner';
                }
                
                return 'angle-double-up';
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
            
            has_error: function ()
            {
                return this.error_message !== null;
            },
            
            filter_is_enabled: function ()
            {
                if (this.filter_load_url !== null && this.filter_search_url !== null) {
                    return true;
                }
                
                return false;
            },
            filter_has_been_selected: function ()
            {
                return this.filter_id !== null && this.filter_id !== ''
            },
            
            related_is_enabled: function ()
            {
                if (
                    this.related_url !== null
                    && this.filter_has_been_selected === true
                ) {
                    return true;
                }
                
                return false;
            },
            related_text: function ()
            {
                return 'View ' + this.filter_term;
            },
            processed_related_url: function ()
            {
                return this.related_url.replace('%id', this.filter_id);
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
                        if (node.parent.children.expanded === true) {
                            line = 'straight-vertical';
                        } else {
                            line = 'none';
                        }
                        
                        node.lines[armIndex] = line;
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
            },
            
            loadParent: function ()
            {
                if (this.is_loading_parent === true) {
                    return;
                }
                
                let url = this.traverse_up_url.replace('%id', this.processed_tree[0].id);
                
                this.is_loading_parent = true;
                this.error_message = null;
                
                axios.get(url)
                    .then(this.loadParentSuccess)
                    .catch(this.loadParentFailure)
                    .finally(this.loadParentCleanup);
            },
            loadParentSuccess: function (response)
            {
                if (response.data === "") {
                    return;
                }
                // TODO Additional flag for no more parents
                let oldTree = this.processed_tree;
                let parentTree = this.processTreeData(response.data);
                
                this.mergeChildTreeWithParent(parentTree, oldTree);
                this.processed_tree = [parentTree];
            },
            loadParentFailure: function (error)
            {
                console.log(error);
                this.error_message = 'Unable to go up the tree; please try again';
            },
            loadParentCleanup: function ()
            {
                this.is_loading_parent = false;
            },

            /**
             * Locates the top-level node in the child tree within the parent tree and merges
             * @param parentTree
             * @param childTree
             */
            mergeChildTreeWithParent: function (parentTree, childTree)
            {
                let index = 0;
                let nodeToJoin = childTree[0];
                let targetNode = parentTree;
                let targetAddress = this.findNodeWithinTree(nodeToJoin.id, parentTree);
                
                if (targetAddress === false) {
                    return;
                }
                
                targetAddress = targetAddress.split(',');
                
                for (index; index < targetAddress.length - 1; index++) {
                    targetNode = targetNode.children.contents[targetAddress[index]];
                }
                
                nodeToJoin.parent = targetNode;
                
                targetNode.children.contents.splice(index, 1);
                targetNode.children.contents.push(nodeToJoin);
                this.recalculateTreeDepthAndLevels(parentTree, 0);
            },

            /**
             * Finds the nested index of the given node if it exists within the tree
             * @param nodeId The node ID to find
             * @param node The tree node to search
             * @return String|Boolean A nested index [0, 1, 2] or false
             */
            findNodeWithinTree: function (nodeId, node)
            {
                for (let index in node.children.contents) {
                    let childNode = node.children.contents[index];
                    
                    if (childNode.id === nodeId) {
                        return index;
                    }
                    
                    let result = this.findNodeWithinTree(nodeId, childNode);
                    if (result !== false) {
                        return index + ',' + result;
                    }
                }
                
                return false;
            },

            /**
             * Recalculates the depth and level properties of the give tree node
             * @param node
             * @param depth
             * @return Number The lowest depth reached
             */
            recalculateTreeDepthAndLevels: function (node, depth)
            {
                let lowestDepth = depth;
                
                node.depth = depth;
                node.levels = 0;
                
                for (let index in node.subtree.contents) {
                    node.subtree.contents[index].depth = depth + 1;
                }
                
                for (let index in node.children.contents) {
                    let lastDepth = this.recalculateTreeDepthAndLevels(node.children.contents[index], depth + 1);
                    
                    if (lastDepth > lowestDepth) {
                        lowestDepth = lastDepth;
                    }
                    
                    let level = lowestDepth - node.depth;
                    
                    if (level > node.levels) {
                        node.levels = level;
                    }
                }
                
                return lowestDepth;
            },
            
            selectFilter: function (event)
            {
                console.log("Filter selected", event);
                this.filter_id = event.target.value;
                
                // Send request to endpoint with topmost node ID and selected ID
            },
            clearFilter: function ()
            {
                console.log("Filter cleared");
                // Send request to endpoint with topmost node ID
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
