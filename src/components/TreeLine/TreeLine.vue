<template>
    <td class="tree-line is-narrow">
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
                required: true,
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
            enabled_directions: function()
            {
                switch (this.direction) {
                    case "cap-up":
                        return this.makeDirections(true);
                        
                    case "cap-down":
                        return this.makeDirections(false, true);
                        
                    case "cap-left":
                        return this.makeDirections(false, false, true);
                        
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
                        return this.makeDirections(true, true);
                        
                    case "straight-horizontal":
                        return this.makeDirections(false, false, true, true);
                        
                    case "tee-up":
                        return this.makeDirections(true, false, true, true);
                        
                    case "tee-down":
                        return this.makeDirections(false, true, true, true);
                        
                    case "tee-left":
                        return this.makeDirections(true, true, true);
                        
                    case "tee-right":
                        return this.makeDirections(true, true, false, true);

                    default:
                        return this.makeDirections();
                }
            },
            
            horizontal_classes: function()
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

            vertical_classes: function()
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
            makeDirections: function (up = false, down = false, left = false, right = false)
            {
                return { up: up, down: down, left: left, right: right }
            }
        }
    }
</script>
