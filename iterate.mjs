/**
 * A module that exports the iterateProperties generator as a part of the WAP project 1
 * @module iterate.js
 * @author Vojtěch Fiala
 */

/**
 * 
 * @param {object} object The object which's properties the generator returns
 * @param {string} filter Filter the results
 */
export function* iterateProperties(object, filter=undefined) {
    
    let obj_arr = []

    // get the entire prototype chain into an array
    while (object) {
        obj_arr.push(object)
        object = Object.getPrototypeOf(object); // get the object's prototype
    }

    // reverse the array so that the highest level is at the start
    obj_arr = obj_arr.reverse()

    // Iterate over the object and its prototypes, from top to bottom
    for (let i = 1; i < obj_arr.length; i++) {
        let object = obj_arr[i]
        let props;

        // get the properties of an object and filter them according to the user filter (if given)
        if (filter != undefined) {
            props = Object.getOwnPropertyNames(object).filter( prop =>
                {
                    for (let part in filter) {
                        let settings = Object.getOwnPropertyDescriptor(object, prop);

                        // undefined means i don't use them in the filter
                        if (settings[part] === undefined) {
                            return false;
                        }
                        if (settings[part] != filter[part]) {
                            return false;
                        }
                    }
                    return true;
                });
        }
        else {
            props = Object.getOwnPropertyNames(object);
        }

        // iterate over the values of the properties (aka the names)
        for (let prop of props) {
            yield prop;
        }
    }
}
