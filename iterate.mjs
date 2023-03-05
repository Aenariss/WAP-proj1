/**
 * A module that exports the iterateProperties generator as a part of WAP project 1
 * @module iterate
 * @author Vojtěch Fiala
 */

/**
 * Function to get the prototypes the given object uses. Returns an array of objects
 * @param {object} object The starting object from which its prototypes will be found
 * @returns {Object[]} An array of objects which make the prototype chain
 */
function getPrototypeList(object) {
    let obj_arr = []

    // get the entire prototype chain into an array
    while (object) {
        obj_arr.push(object)
        object = Object.getPrototypeOf(object); // get the object's prototype
    }

    // reverse the array so that the (null) level is at the start
    obj_arr = obj_arr.reverse()
    return obj_arr
}

/**
 * A callback function for the filter() function. Filters the unwanted data out. In case the descriptor is not defined, it filters the property out.
 * @param {object} prop The property descriptor which is being filtered 
 * @returns {boolean} Boolean value upon which depends if the value should be filtered out
 */
function applyFilter(desc) {
    // go through all parts of the filter, because of the nature of the callback func, is accessed through `this`
    for (let part in this.filter) {
        // get all the filterable values in the given object's property
        let settings = Object.getOwnPropertyDescriptor(this.object, desc);
        // undefined means i don't use them in the filter
        if (settings[part] === undefined) {
            return false;
        }
        if (settings[part] !== this.filter[part]) {
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {object} object The object which's properties the generator returns
 * @param {object} filter Filter to get only the filtered results
 */
export function* iterateProperties(object, filter=undefined) {
    
    let obj_arr = getPrototypeList(object)

    // Iterate over the object and its prototypes, from top to bottom
    for (let i = 0; i < obj_arr.length; i++) {
        let object = obj_arr[i]
        let props;

        // get the properties of an object and filter them according to the user filter (if given)
        if (filter !== undefined) {
            // second parameter values can be accessed using `this`, so I'll use both things I want there
            props = Object.getOwnPropertyNames(object).filter(applyFilter, {filter: filter, object: object});
        }
        else {
            props = Object.getOwnPropertyNames(object);
        }

        // iterate over the values of the properties (the names) and yield them
        for (let prop of props) {
            yield prop;
        }
    }
}
