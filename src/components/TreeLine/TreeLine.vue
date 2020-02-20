<template>
    <td :class="tree_line_classes">
        <div :class="horizontal_classes"></div>
        <div :class="vertical_classes"></div>
    </td>
</template>

<script>
    import {inList} from '../../mixins/FoxValidators.js';
    
    export default {
        name: 'tree-line',
        
        props: {
            direction: {
                type: String,
                default: 'none',
                validator: inList([
                    'cap-up',
                    'cap-down',
                    'cap-left',
                    'cap-right',
                    'cross',
                    'elbow-up-left',
                    'elbow-up-right',
                    'elbow-down-left',
                    'elbow-down-right',
                    'none',
                    'straight-horizontal',
                    'straight-vertical',
                    'tee-up',
                    'tee-down',
                    'tee-left',
                    'tee-right'
                ])
            }
        },
        
        computed: {
            enabled_directions: function ()
            {
                switch (this.direction) {
                    case "cap-up":
                        return this.makeDirections(true, false, false, false);
                        
                    case "cap-down":
                        return this.makeDirections(false, true, false, false);
                        
                    case "cap-left":
                        return this.makeDirections(false, false, true, false);
                        
                    case "cap-right":
                        return this.makeDirections(false, false, false, true);

                    case "cross":
                        return this.makeDirections(true, true, true, true);
                        
                    case "elbow-up-left":
                        return this.makeDirections(true, false, true, false);
                        
                    case "elbow-up-right":
                        return this.makeDirections(true, false, false, true);
                        
                    case "elbow-down-left":
                        return this.makeDirections(false, true, true, false);
                        
                    case "elbow-down-right":
                        return this.makeDirections(false, true, false, true);
                        
                    case "straight-vertical":
                        return this.makeDirections(true, true, false, false);
                        
                    case "straight-horizontal":
                        return this.makeDirections(false, false, true, true);
                        
                    case "tee-up":
                        return this.makeDirections(true, false, true, true);
                        
                    case "tee-down":
                        return this.makeDirections(false, true, true, true);
                        
                    case "tee-left":
                        return this.makeDirections(true, true, true, false);
                        
                    case "tee-right":
                        return this.makeDirections(true, true, false, true);

                    default:
                        return this.makeDirections(false, false, false, false);
                }
            },
            
            tree_line_classes: function ()
            {
                let classes = [
                    'tree-line',
                    'is-narrow'
                ];
                
                if (this.enabled_directions.up === true) {
                    classes.push('up');
                }

                if (this.enabled_directions.right === true) {
                    classes.push('right');
                }

                if (this.enabled_directions.down === true) {
                    classes.push('down');
                }

                if (this.enabled_directions.left === true) {
                    classes.push('left');
                }
                
                return classes;
            },
            
            horizontal_classes: function ()
            {
                if (this.enabled_directions.left === true && this.enabled_directions.right === true) {
                    return ["horizontal", "full-width"];

                } else if (this.enabled_directions.left === true) {
                    return ["horizontal", "left-only"];

                } else if (this.enabled_directions.right === true) {
                    return ["horizontal", "right-only"];
                }
                
                return [];
            },

            vertical_classes: function ()
            {
                if (this.enabled_directions.up === true && this.enabled_directions.down === true) {
                    return ["vertical", "full-height"];

                } else if (this.enabled_directions.up === true) {
                    return ["vertical", "up-only"];

                } else if (this.enabled_directions.down === true) {
                    return ["vertical", "down-only"];
                }

                return [];
            }
        },
        
        methods: {
            makeDirections: function (up, down, left, right)
            {
                return { up: up, down: down, left: left, right: right }
            }
        }
    }
</script>
