import { expect } from 'jest';
import { shallowMount } from '@vue/test-utils';

class TestCase {
    // Abstract Methods
        /**
         * A reference to the Vue component class to be tested
         */
        componentToTest() {}
        
        /**
         * Tasks to be performed prior to testing
         */
        setup() {}
    
        /**
         * The test to be performed on this.component
         */
        test() {}
    
        /**
         * Tasks to be performed after testing
         */
        teardown() {}

    // Construction
        constructor() {
            this.component = shallowMount(this.componentToTest());
            
            this.setup();
            this.test();
            this.teardown();
        }
}

export { TestCase as default };
