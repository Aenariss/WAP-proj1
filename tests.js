/**
 * File that contains all the tests to test the functionality of the iterate.mjs module.
 */

import { iterateProperties } from "./iterate.mjs";

// count total passed and failed
var totalPass = 0;
var totalFail = 0;

/**
 * print final results
 */
function printResults(name, pass, fail) {
    if (name !== "ALL TOGETHER") {
        totalFail += fail;
        totalPass += pass;
    }
    console.log('****************')
    console.log("Test suite:", name, "\nPASSED:", pass, '\nFAILED:', fail)
    console.log('****************')
}

/**
 * print beginning of a suite
 */
function printBeginning(name) {
    console.log('****************')
    console.log(name)
}

/**
 * print test results in the format of given input | expected output
 */
function printTest(name, inp, out) {
    let passed;
    let res;
    if (inp === out) {
        passed = "✓"
        res = 1
    }
    else {
        passed = "✗"
        res = 0
    }
    // dont spam the stdout with very long outputs if correct
    if ((inp.length == out.length) && out.length > 30)
        console.log(name + ':', passed)
    else
        console.log(name + ':', inp, '|',  out, passed)
    return res
}

/**
 * get the output of the generator
 */
function getOutput(generator) {
    let res = ""
    for (let prop of generator) {
        res += " " + prop
    }
    return res
}

/**
 * basic tests
 */
function basicFunctionality() {
    printBeginning("BASIC FUNCTIONALITY TESTS")
    let pass = 0
    let res1 = getOutput(iterateProperties(Object.prototype))
    pass += printTest("Object Prototype returns something", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString")

    let res2 = getOutput(iterateProperties({}))
    pass += printTest("Empty {} returns something", res2, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString")

    let res3 = getOutput(iterateProperties())
    pass += printTest("Empty {} returns something", res3, "")

    let res4 = getOutput(iterateProperties({x: 1}))
    pass += printTest("Object Prototype & 1 custom", res4, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x")

    let res5 = getOutput(iterateProperties({x: 1, y: 5}))
    pass += printTest("Object Prototype & 2 custom", res5, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x y")

    let fail = 5 - pass
    printResults("BASIC FUNCTIONALITY TESTS", pass, fail)
}

/**
 * tests with editing object properties
 */
function editingProperties() {
    printBeginning("PROPERTIES FUNCTIONALITY TESTS")
    let pass = 0
    
    let z = Object.create({x: 1})
    Object.defineProperty(z, "x", {
        configurable: false,
        writable: true
    });

    let res1 = getOutput(iterateProperties(z))
    pass += printTest("Object Prototype & 1 custom definedProperty", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x x")

    Object.defineProperty(z, "y", {
        configurable: false,
        writable: false
    });
    let res2 = getOutput(iterateProperties(z))
    pass += printTest("Object Prototype & 2 custom definedProperty", res2, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x x y")


    let res3 = getOutput(iterateProperties(z, {configurable: false}))
    pass += printTest("writable custom", res3, " x y")

    let res4 = getOutput(iterateProperties(z, {writable: false}))
    pass += printTest("configurable custom", res4, " y")

    let iterator1 = iterateProperties({x: 1, y: 5}, {enumerable: true})
    let iterator2 = iterateProperties({y: 1, x: 1}, {enumerable: true})
    let res5 = iterator1.next().value
    pass += printTest("Two instances - inst one - 1", res5, "x")
    let res6 = iterator2.next().value
    pass += printTest("Two instances - inst two - 1", res6, "y")
    let res7 = iterator2.next().value
    pass += printTest("Two instances - inst two - 2", res7, "x")
    let res8 = iterator1.next().value
    pass += printTest("Two instances - inst one - 2", res8, "y")
    

    let fail = 8 - pass
    printResults("PROPERTIES FUNCTIONALITY TESTS", pass, fail)
}

/**
 * tests with advanced object properties filtering
 */
function advancedProperties() {
    printBeginning("ADVANCED PROPERTIES FUNCTIONALITY TESTS")
    let pass = 0

    let z = {}
    Object.defineProperty(z, "x", {
        value: 5,
        writable: false,
        configurable: true,
        enumerable: true
    })

    let res1 = getOutput(iterateProperties(z, {writable: false}))
    pass += printTest("unwritable", res1, " x")

    let res2 = getOutput(iterateProperties(z, {value: 5}))
    pass += printTest("value-5", res2, " x")

    let res3 = getOutput(iterateProperties({}, {writable: true}))
    pass += printTest("writable Object prototype", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")

    let res4 = getOutput(iterateProperties({}, {configurable: false}))
    pass += printTest("unconfigurable Object Prototype", res4, "")

    let res5 = getOutput(iterateProperties({x: 1}, {}))
    pass += printTest("empty filter ", res5, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x")


    let fail = 5 - pass
    printResults("ADVANCED PROPERTIES FUNCTIONALITY TESTS", pass, fail)
}

/**
 * tests using multiple filters at the same time
 */
function multipleFilters() {
    printBeginning("MULTIPLE FILTERS TESTS")
    let pass = 0

    let res1 = getOutput(iterateProperties({}, {writable: true, enumerable: false}))
    pass += printTest("{} - writable & not enumerable", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")

    let res2 = getOutput(iterateProperties({}, {writable: true, enumerable: false, configurable: false}))
    pass += printTest("{} - writable & not enumerable & not ocnfigurable", res2, "")

    let res3 = getOutput(iterateProperties({}, {writable: true, enumerable: false, configurable: true}))
    pass += printTest("{} - writable & not enumerable & ocnfigurable", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")


    let z = {}
    Object.defineProperty(z, "x", {
        value: 5,
        writable: true,
        configurable: false,
        enumerable: false
    });
    Object.defineProperty(z, "y", {
        value: 5,
        writable: true,
        configurable: false,
        enumerable: false
    });

    let res4 = getOutput(iterateProperties(z, {writable: true, enumerable: false, configurable: false}))
    pass += printTest("2 custom properties multiple filters", res4, " x y")

    let res5 = getOutput(iterateProperties(z, {enumerable: false, value: 5}))
    pass += printTest("not enumerable & value", res5, " x y")

    let fail = 5 - pass
    printResults("MULTIPLE FILTERS TESTS", pass, fail)
}

function advancedConstructs() {
    printBeginning("ADVANCED CONSTRUCTS TESTS")
    let pass = 0

    function smth(x) {
        this.val = x;
    }
    smth.prototype = {
        val: 5,
    }

    let res1 = getOutput(iterateProperties(new smth(4), {enumerable: true}))
    pass += printTest("function & prototype", res1, " val val")

    function smth2(x) {
        this.val = x;
    }

    let res2 = getOutput(iterateProperties(new smth2(4), {enumerable: true}))
    pass += printTest("function & prototype 2", res2, " val")

    let res3 = getOutput(iterateProperties(new smth2(4)))
    pass += printTest("function & prototype 3", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString constructor val")

    class smthClass {
        x;
        y;
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
    }

    let res4 = getOutput(iterateProperties(new smthClass(1,2), {enumerable: true}))
    pass += printTest("class 1", res4, " x y")

    let res5 = getOutput(iterateProperties(new smthClass(), {enumerable: true}))
    pass += printTest("class empty constr 1", res5, " x y")

    class smth2Class {
        x;
    }

    let res6 = getOutput(iterateProperties(new smth2Class(), {enumerable: true}))
    pass += printTest("class empty constr 2", res6, " x")


    let fail = 6 - pass
    printResults("ADVANCED CONSTRUCTS TESTS", pass, fail)
}

basicFunctionality()
editingProperties()
advancedProperties()
multipleFilters()
advancedConstructs()
printResults("ALL TOGETHER:", totalPass, totalFail)
