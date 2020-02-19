import Vue from 'vue';
import NestedTree from './NestedTree.vue';

import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";

require('./assets/styles/main.scss');

library.add(fas);

Vue.component("nested-tree", NestedTree);
Vue.config.productionTip = false;

new Vue().$mount('#app');
