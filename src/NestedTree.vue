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
                        <font-awesome-icon icon="eye" title="View Selection"></font-awesome-icon>
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
                    <div @click="downloadCsv" class="has-text-primary is-interactive">
                        <font-awesome-icon icon="download" title="Download"></font-awesome-icon>
                    </div>
                </div>
                
                <slot name="header-right"></slot>
            </div>
        </div>
        
        <table class="table is-striped nested-tree">
            <thead>
                <tr>
                    <th @click="loadParent" :class="upward_traversal_button_classes">
                        <font-awesome-icon
                            :icon="upward_traversal_icon"
                            :pulse="is_loading_parent === true"
                            title="Go Up One level"
                            size="lg"
                        ></font-awesome-icon>
                    </th>
                    
                    <th :colspan="title_span">
                        <div class="tag is-danger" v-if="has_load_parent_error === true">
                            <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
                            {{ load_parent_error }}
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
                <tr v-if="is_loading_tree === true">
                    <td :colspan="table_width" class="has-text-centered notification is-grey has-text-grey has-text-weight-bold">
                        <font-awesome-icon icon="spinner" pulse class="inline-icon"></font-awesome-icon>
                        Loading Tree...
                    </td>
                </tr>
                
                <tr v-else-if="is_processing === true">
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

                <template v-else>
                    <tr v-if="has_load_tree_error === true">
                        <td :colspan="table_width" class="has-text-centered notification is-danger has-text-weight-bold">
                            <font-awesome-icon icon="exclamation-triangle" class="inline-icon"></font-awesome-icon>
                            {{ load_tree_error }}
                        </td>
                    </tr>
                    
                    <template v-for="row in displayed_tree">
                        <subtree-row
                            v-if="row.type === 'subtree'"
                            :key="row.uid"
                            :row_data="row"
                            :columns="columns"
                            :groups="groups"
                            :tree_width="details_width"
                            :is_grouped="is_grouped"
                            :is_percented="is_percented"
                        ></subtree-row>
                        
                        <tree-row
                            v-else
                            :key="row.uid"
                            :row_data="row"
                            :columns="columns"
                            :filter_id="filter_id"
                            :groups="groups"
                            :tree_width="details_width"
                            :is_grouped="is_grouped"
                            :is_percented="is_percented"
                            :percentage_of="percentage_of"
                            :subtree_url="subtree_url"
                            :traverse_down_url="traverse_down_url"
                            :children_term="children_term"
                            :subtree_term="subtree_term"
                        ></tree-row>
                    </template>
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
    import percentage_of from './mixins/props/percentage_of';
    import LookupItem from "./components/LookupItem/LookupItem";
    import prepareUrl from './mixins/methods/PrepareUrl.js';
    import CsvProcessing from './mixins/methods/CsvProcessing.js';
    import children_term from "./mixins/props/children_term";
    import subtree_term from "./mixins/props/subtree_term";

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
            NodeProcessing,
            prepareUrl,
            CsvProcessing,
            children_term,
            subtree_term
        ],
        
        data: function ()
        {
            return {
                processed_tree: [],
                is_processing: false,
                is_grouped: this.start_grouped,
                is_percented: this.start_percented,
                is_loading_parent: false,
                is_loading_tree: false,
                load_parent_error: null,
                load_tree_error: null,
                filter_id: this.filter_initial_id
            }
        },
        
        props: {
            csv_details_fields: {
                type: Array,
                required: true
            },
            
            filter_initial_id: {
                type: String|Number,
                default: null
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
                    let visibleNodes = this.filterVisibleNodes(this.processed_tree[index], false);
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
            
            upward_traversal_button_classes: function ()
            {
                if (this.can_traverse_upward === true) {
                    return 'is-narrow is-interactive has-text-primary';
                }
                
                return 'is-narrow has-text-grey-lighter';
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
            top_node: function ()
            {
                if (this.processed_tree.length < 1) {
                    return null;
                }
                
                return this.processed_tree[0];
            },
            
            show_download_button: function ()
            {
                return this.tree_is_empty === false;
            },
            
            can_traverse_upward: function ()
            {
                if (this.top_node === null) {
                    return false;
                }
                
                return this.upward_traversal_is_enabled === true && this.top_node.parent === true;
            },
            has_load_parent_error: function ()
            {
                return this.load_parent_error !== null;
            },
            has_load_tree_error: function ()
            {
                return this.load_tree_error !== null;
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
                        this.processTreeData(sourceTree[index], null)
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
            filterVisibleNodes: function (treeNode, hasSiblingAfter)
            {
                let visibleNodes = [];
                
                if (this.nodeIsVisible(treeNode) === false) {
                    return false;
                }
                
                this.calculatePassthroughLines(treeNode, hasSiblingAfter, false);
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
            calculatePassthroughLines: function (node, hasSiblingAfter, isSubtree)
            {
                let line;
                let lines = [];
                let armIndex = node.depth - 1;
                
                if (typeof node.parent === 'object') {
                    for (let index in node.parent.lines) {
                        switch (node.parent.lines[index]) {
                            case 'tee-right':
                            case 'straight-vertical':
                                lines[index] = 'straight-vertical';
                                break;

                            default:
                                lines[index] = 'none';
                        }
                    }

                    if (isSubtree === true) {
                        if (node.parent.children.expanded === true) {
                            line = 'straight-vertical';
                        } else {
                            line = 'none';
                        }
                        
                        lines[armIndex] = line;
                        armIndex++;
                    }
                    
                    if (hasSiblingAfter === true) {
                        line = 'tee-right';
                    } else {
                        line = 'elbow-up-right';
                    }

                    lines[armIndex] = line;
                }
                
                this.$set(node, 'lines', lines);
            },
            
            /**
             * Determine whether or not a tree node should be visible
             * @param treeNode Object The node to test
             * @return Boolean
             */
            nodeIsVisible: function (treeNode)
            {
                if (typeof treeNode.parent !== 'object') {
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
                if (this.is_loading_parent === true || this.can_traverse_upward === false) {
                    return;
                }
                
                let url = this.prepareUrl(this.traverse_up_url, this.top_node.id, this.filter_id);
                this.is_loading_parent = true;
                this.load_parent_error = null;
                
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
                
                let oldTree = this.processed_tree;
                let parentTree = this.processTreeData(response.data, null);
                
                this.mergeChildTreeWithParent(parentTree, oldTree);
                this.processed_tree = [parentTree];
            },
            loadParentFailure: function (error)
            {
                console.log(error);
                this.load_parent_error = 'Unable to go up the tree; please try again';
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
                
                targetNode.children.contents.splice(targetAddress[targetAddress.length - 1], 1);
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
            
            selectFilter: function (item)
            {
                this.filter_id = item.id;
                this.loadTree();
            },
            clearFilter: function ()
            {
                this.filter_id = null;
                this.loadTree();
            },
            
            loadTree: function ()
            {
                this.is_loading_tree = true;
                this.load_tree_error = null;
                
                let url = this.prepareUrl(this.filter_load_url, this.top_node.id, this.filter_id);
                
                axios.get(url)
                    .then(this.loadTreeSuccess)
                    .catch(this.loadTreeFailure)
                    .finally(this.loadTreeCleanup);
            },
            loadTreeSuccess: function (response)
            {
                if (response.data === '') {
                    this.loadTreeFailure();
                    return;
                }

                if (Array.isArray(response.data) === false) {
                    response.data = [ response.data ];
                }
                
                this.processed_tree = this.createProcessedTree(response.data);
            },
            loadTreeFailure: function (error)
            {
                console.log(error);
                this.load_tree_error = 'Unable to load the requested tree; please try again';
            },
            loadTreeCleanup: function ()
            {
                this.is_loading_tree = false;
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
            },
            displayed_tree: function ()
            {
                this.$emit('updated', this.displayed_tree);
            }
        }
    }
</script>
