<template>
    <div
        @keydown.esc="deactivateLookup"
        @focusout="deactivateLookup"
        :class="lookup_classes"
    >
        <div class="dropdown-trigger">
            <div class="field">
                <div class="control has-icons-left has-icons-right">
                    <span class="icon is-left has-text-grey">
                        <font-awesome-icon :icon="search_icon" :pulse="is_searching"></font-awesome-icon>
                    </span>
                    <input
                        v-model="search_term"
                        @click="activateLookup"
                        class="input"
                        type="text"
                        :placeholder="placeholder"
                        :aria-label="placeholder"
                    />
                    <span
                        v-show="search_term.length > 0"
                        @click="clearSelection"
                        class="icon is-right has-text-primary is-interactive"
                    >
                        <font-awesome-icon icon="times" title="Clear Search Term"></font-awesome-icon>
                    </span>
                </div>
            </div>
        </div>
        
        <div v-show="has_searched === true" class="dropdown-menu">
            <div class="dropdown-content">
                <div @click="deactivateLookup" v-show="has_no_results === true" class="dropdown-item">
                    <font-awesome-icon icon="info-circle" size="lg"></font-awesome-icon>
                    No results; please try a different term
                </div>

                <div @click="deactivateLookup" v-show="has_error === true" class="dropdown-item">
                    <div class="level">
                        <font-awesome-icon icon="exclamation-triangle" size="lg" class="level-item"></font-awesome-icon>
                        <p class="level-item">{{ error_message }}</p>
                    </div>
                </div>
                
                <div
                    v-for="item in items_found"
                    :key="item.id"
                    @click="selectItem(item)"
                    class="dropdown-item is-interactive"
                >
                    <p
                        v-for="(text, index) in item.details"
                        :key="index"
                        :class="itemDetailClasses(index)"
                    >{{ text }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {greaterThanOrEqual, isNotBlank} from '../../mixins/FoxValidators';
    import axios from 'axios';
    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

    export default {
        name: 'lookup-item',
        
        components: {
            FontAwesomeIcon
        },
        
        data: function ()
        {
            return {
                error_message: null,
                has_searched: false,
                is_active: false,
                is_searching: false,
                items_found: [],
                item_selected: null,
                search_term: this.initial_term,
                search_timer: null
            }
        },
        
        props: {
            initial_term: {
                type: String,
                default: ''
            },
            lookup_url: {
                type: String,
                required: true,
                validator: isNotBlank()
            },
            min_length: {
                type: Number,
                default: 3,
                validator: greaterThanOrEqual(0)
            },
            placeholder: {
                type: String,
                default: 'Type to search...',
                validator: isNotBlank()
            }
        },
        
        computed: {
            has_error: function ()
            {
                return this.error_message !== null;
            },
            has_no_results: function ()
            {
                if (this.has_searched === false) {
                    return false;
                }
                
                if (this.has_error === true) {
                    return false;
                }
                
                return this.items_found.length < 1;
            },
            lookup_classes: function ()
            {
                let classes = [
                    'lookup-item',
                    'dropdown'
                ];
                
                if (this.is_active === true) {
                    classes.push( 'is-active');
                }
                
                return classes;
            },
            search_icon: function ()
            {
                if (this.is_searching === true) {
                    return 'spinner';
                }
                
                return 'search';
            }
        },
        
        methods: {
            activateLookup: function ()
            {
                this.is_active = true;
            },
            deactivateLookup: function (now = false)
            {
                if (now === true) {
                    this.deactivateLookupAfterInterval();
                } else {
                    window.setTimeout(this.deactivateLookupAfterInterval, 110);
                }
            },
            deactivateLookupAfterInterval: function ()
            {
                this.is_active = false;
            },
            
            clearSelection: function ()
            {
                this.has_searched = false;
                this.items_found = [];
                this.item_selected = null;
                this.search_term = '';
                
                this.$emit('cleared');
            },
            selectItem: function (item)
            {
                this.deactivateLookup(true);
                this.item_selected = item;
                this.search_term = item.details[0];
                this.$emit('selected', item);
            },
            itemDetailClasses: function (index)
            {
                if (index === 0) {
                    return 'has-text-weight-bold';
                }
                
                return ''
            },
            
            readyLookup: function ()
            {
                if (this.search_timer !== null) {
                    window.clearTimeout(this.search_timer);
                }
                
                if (this.is_searching === true) {
                    return false;
                }
                
                if (this.search_term === '') {
                    this.clearSelection();
                    return false;
                }
                
                if (this.search_term.length < this.min_length) {
                    return false;
                }
                
                this.search_timer = window.setTimeout(this.lookupItem, 300);
            },
            lookupItem: function ()
            {
                this.has_searched = false;
                this.is_searching = true;
                this.$emit('searching', this.search_term);
                
                axios.post(
                    this.lookup_url,
                    {
                        search_term: this.search_term
                    }
                )
                    .then(this.lookupSuccess)
                    .catch(this.lookupFailure)
                    .finally(this.lookupCleanup);
            },
            lookupSuccess: function (response)
            {
                if (response.data === '') {
                    this.items_found = [];
                } else {
                    this.items_found = response.data;
                }
            },
            lookupFailure: function (error)
            {
                console.log(error);
                this.error_message = 'An error occurred while searching; please try again';
            },
            lookupCleanup: function ()
            {
                this.has_searched = true;
                this.is_searching = false;
                this.search_timer = null;
                this.$emit('searched');
            }
        },
        
        watch: {
            search_term: function ()
            {
                if (this.is_active === false) {
                    return;
                }
                
                this.has_searched = false;
                this.items_found = [];
                
                this.readyLookup();
            }
        }
    }
</script>
