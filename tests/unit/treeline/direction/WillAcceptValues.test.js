import TestTreeLine from '../TestTreeLine.js';

class WillAcceptValues extends TestTreeLine {
    test() {
        assert.isOk(this.component.setProps({
                direction: 'cap-up'
            })
        );
    }
}
