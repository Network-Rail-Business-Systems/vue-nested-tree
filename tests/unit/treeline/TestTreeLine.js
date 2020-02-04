import TestCase from '../../TestCase.js';
import TreeLine from '../../../src/components/TreeLine.vue';

class TestTreeLine extends TestCase {
    componentToTest() {
        return TreeLine;
    }
}

export { TestTreeLine as default };
