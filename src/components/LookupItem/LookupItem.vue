<template>
    <div
        ref="base"
        @keydown.esc="deactivateLookup"
        @focusout="deactivateLookupAfterInterval($event)"
        :class="lookup_classes"
        aria-haspopup="true"
        :aria-expanded="is_active === true && has_searched === true"
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
                        @keydown.space="clearSelection"
                        tabindex="0"
                        class="icon is-right has-text-primary is-interactive"
                        role="button"
                    >
                        <font-awesome-icon icon="times" title="Clear Search Term"></font-awesome-icon>
                    </span>
                </div>
            </div>
        </div>

        <div
            v-show="has_searched === true"
            class="dropdown-menu"
        >
            <div class="dropdown-content">
                <div
                    v-show="has_no_results === true"
                    @click="deactivateLookup"
                    @keydown.space="deactivateLookup"
                    tabindex="0"
                    class="dropdown-item"
                >
                    <font-awesome-icon icon="info-circle" size="lg"></font-awesome-icon>
                    No results; please try a different term
                </div>

                <div
                    v-show="has_error === true"
                    @click="deactivateLookup"
                    @keydown.space="deactivateLookup"
                    tabindex="0"
                    class="dropdown-item"
                >
                    <div class="level">
                        <font-awesome-icon icon="exclamation-triangle" size="lg" class="level-item"></font-awesome-icon>
                        <p class="level-item">{{ error_message }}</p>
                    </div>
                </div>

                <div v-show="lookup_pagination && has_previous_page"
                     class="dropdown-item is-interactive"
                     @mouseup="previousPage()"
                     @keydown.space="previousPage()"
                >
                  <a class="lookup-item-pagination" tabindex="0">
                    <span class="icon">
                        <font-awesome-icon icon="chevron-left" title="Previous"></font-awesome-icon>
                    </span>
                    <span>Previous</span>
                  </a>
                </div>

                <div
                    v-for="item in items_found"
                    :key="item.id"
                    @click="selectItem(item)"
                    @keydown.space="selectItem(item)"
                    tabindex="0"

                    class="dropdown-item is-interactive"
                >
                    <p
                        v-for="(text, index) in item.details"
                        :key="index"
                        :class="itemDetailClasses(index)"
                    >{{ text }}</p>
                </div>
                <div v-show="lookup_pagination && has_next_page"
                     class="dropdown-item is-interactive"
                     @mouseup="nextPage()"
                     @keydown.space="nextPage()"

                >
                    <a class="lookup-item-pagination" tabindex="0">
                      <span class="icon">
                          <font-awesome-icon icon="chevron-right" title="Next"></font-awesome-icon>
                      </span>
                      <span>Next</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {greaterThanOrEqual, isNotBlank} from '../../mixins/FoxValidators.js';
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
                focus_timer: null,
                has_searched: false,
                is_active: false,
                is_searching: false,
                items_found: [],
                item_selected: null,
                search_term: this.initial_term,
                search_timer: null,
                page: 1,
                has_previous_page: false,
                has_next_page: false,
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
            },
            lookup_pagination: {
              type: Boolean,
              default: false
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
                if (this.focus_timer !== null) {
                    window.clearTimeout(this.focus_timer);
                    this.focus_timer = null;
                }

                this.is_active = true;
            },
            deactivateLookupAfterInterval: function (event)
            {
                if (this.$refs.base.contains(event.relatedTarget) === true) {
                    return false;
                }

                this.focus_timer = window.setTimeout(this.deactivateLookup, 110);
            },
            deactivateLookup: function ()
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
                this.item_selected = item;
                this.search_term = item.details[0];
                this.$emit('selected', item);
                this.deactivateLookup();
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

                axios.get(
                    `${this.lookup_url}?page=${this.page}&search_term=${this.search_term}`
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
                    if (typeof response.data.data === 'object') {
                        this.items_found = response.data.data;
                        if (this.lookup_pagination) {
                          this.has_previous_page = response.data.links.prev !== null;
                          this.has_next_page = response.data.links.next !== null;
                        }
                    } else {
                        this.items_found = response.data;
                    }
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
            },
            previousPage: function ()
            {
                if (this.page === 1) {
                    this.has_previous_page = false;
                }

                this.page = this.page -1;
                this.lookupItem();
                window.setTimeout(this.activateLookup, 110);
            },
            nextPage: function ()
            {
                this.page = this.page + 1;
                this.lookupItem();
                window.setTimeout(this.activateLookup, 110);
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
