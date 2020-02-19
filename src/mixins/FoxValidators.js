/**
 * Validate VueJS Props with these handy-dandy validators
 *
 * @author Anthony Edmonds
 * @link https://github.com/AnthonyEdmonds
 * 
 * Include the required validators in your component
 * script tag and provide any required comparators
 * 
 * When Vue runs it will automatically pass the 
 * value of the prop into the validator
 * 
 * <script>
 *     import {inList} from "../mixins/FoxValidators";
 *     
 *     export default {
 *         props: {
 *             direction: {
 *                 type: String,
 *                 required: true,
 *                 validator: inList([
 *                     'up',
 *                     'down',
 *                     'left',
 *                     'right'
 *                 ])
 *             }
 *         }
 *     }
 * </script>
 */

/**
 * Ensure that a given value strictly matches the comparison
 * @param {*} comparison What value to compare against
 * @returns {function(*): boolean}
 */
function isEqualTo(comparison) {
    return function (value) {
        return value === comparison;
    }
}

/**
 * Ensure that a given value does not strictly match the comparison
 * @param {*} comparison What value to compare against
 * @returns {function(*): boolean}
 */
function isNotEqualTo(comparison) {
    return function (value) {
        return value !== comparison;
    }
}

/**
 * Ensure the given value is strictly an empty string
 * @returns {function(*): boolean}
 */
function isBlank() {
    return function (value) {
        return value === "";
    }
}

/**
 * Ensure the given value is strictly not an empty string
 * @returns {function(*): boolean}
 */
function isNotBlank() {
    return function (value) {
        return value !== "";
    }
}

/**
 * Ensure the given object is a specific length
 * You must provide an object that has a length property, such as a string or array
 * @param {number} length What value.length must be equal to
 * @returns {function(*): boolean}
 */
function isLength(length) {
    return function (value) {
        return value.length === length;
    }
}

/**
 * Ensure the given object is longer than a specific length
 * You must provide an object that has a length property, such as a string or array
 * @param {number} length What value.length must be greater than
 * @returns {function(*): boolean}
 */
function longerThan(length) {
    return function (value) {
        return value.length > length;
    }
}

/**
 * Ensure the given object is shorter than a specific length
 * You must provide an object that has a length property, such as a string or array
 * @param {number} length What value.length must be shorter than
 * @returns {function(*): boolean}
 */
function shorterThan(length) {
    return function (value) {
        return value.length < length;
    }
}

/**
 * Ensure that the given numeric value is greater than the comparison
 * @param {number} comparison What the value must be greater than
 * @returns {function(*): boolean}
 */
function greaterThan(comparison)
{
    return function (value) {
        return value > comparison;
    }
}

/**
 * Ensure that the given numeric value is greater than or equal to the comparison
 * @param {number} comparison What the value must be greater than or equal to
 * @returns {function(*): boolean}
 */
function greaterThanOrEqual(comparison)
{
    return function (value) {
        return value >= comparison;
    }
}

/**
 * Ensure that the given value is less than the comparator
 * @param {number} comparison What value must be less than
 * @returns {function(*): boolean}
 */
function lessThan(comparison)
{
    return function (value) {
        return value < comparison;
    }
}

/**
 * Ensure that the give value is lower or equal than the comparator
 * @param {number} comparison The highest value can be
 * @returns {function(*): boolean}
 */
function lessThanOrEqual(comparison)
{
    return function (value) {
        return value <= comparison;
    }
}

/**
 * Ensure that the given numeric value is between two comparators 
 * @param {number} lowest The minimum value can be
 * @param {number} highest The maximum value can be
 * @returns {function(*=): boolean}
 */
function between(lowest, highest)
{
    return function (value) {
        if (value < lowest) {
            return false;
        }

        if (value > highest) {
            return false;
        }

        return true;
    }
}

/**
 * Ensure the given value is contained within a list
 * @param {[]} list A list of valid values
 * @returns {function(*=): boolean}
 */
function inList(list) {
    return function (value) {
        return list.indexOf(value) !== -1;
    }
}

/**
 * Ensure the given value is not contained within a list
 * @param {[]} list A list of invalid values
 * @returns {function(*=): boolean}
 */
function notInList(list) {
    return function (value) {
        return list.indexOf(value) === -1;
    }
}

/**
 * Ensure that the given array of objects each contain the given keys
 * @param {string[]} keys A list of required object keys
 * @returns {function(...[*]=)}
 */
function objectsHaveKeys(keys) {
    return function (objects) {
        if (Array.isArray(objects) === false) {
            return false;
        }

        for (let object in objects) {
            let properties = Object.keys(objects[object]);

            for (let key in keys) {
                if (properties.includes(keys[key]) === false) {
                    return false;
                }
            }
        }

        return true;
    }
}

/**
 * Ensure an object has the given keys
 * @param {string[]} keys A list of required object keys
 * @returns {function(...[*]=)}
 */
function objectHasKeys(keys) {
    return function (object) {
        let properties = Object.keys(object);

        for (let key in keys) {
            if (properties.includes(keys[key]) === false) {
                return false;
            }
        }

        return true;
    }
}

export {
    isEqualTo, isNotEqualTo,
    isBlank, isNotBlank,
    isLength, longerThan, shorterThan,
    greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, between,
    inList, notInList,
    objectsHaveKeys, objectHasKeys
}
