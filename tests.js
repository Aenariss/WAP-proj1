/**
 * Tests for the `iterate.mjs` module
 */

import { iterateProperties } from "./iterate.mjs";

// count total passed and failed
var totalPass = 0;
var totalFail = 0;

/**
 * print results of a test suite
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
    // dont spam the stdout with very long outputs if both correct
    if ((inp.length === out.length) && out.length > 30 && res === 1)
        console.log(name + ':', passed)
    else
        console.log(name + ':', inp, '|',  out, passed)
    return res
}

/**
 * get the output of the generator and return it as a string
 */
function getOutput(generator) {
    let res = ""
    for (let prop of generator) {
        res += " " + prop
    }
    return res
}

/**
 * basic tests focusing on basic functionality
 */
function basicFunctionality() {
    printBeginning("BASIC FUNCTIONALITY TESTS")
    let pass = 0
    let res1 = getOutput(iterateProperties(Object.prototype))
    // Object.Prototype returns correct functions
    pass += printTest("Object Prototype returns something >", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString")

    let res2 = getOutput(iterateProperties({}))
    // {} returns correct functions
    pass += printTest("Empty {} returns object.prototype >", res2, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString")

    let res3 = getOutput(iterateProperties())
    // no argument doesnt return anything
    pass += printTest("Empty {} returns object.prototype >", res3, "")

    let res4 = getOutput(iterateProperties({x: 1}))
    // defined value of `x` returns Object.prototype and x
    pass += printTest("Object Prototype & 1 custom value >", res4, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x")

    let res5 = getOutput(iterateProperties({x: 1, y: 5}))
    // defined value of `x` returns Object.prototype and x & y
    pass += printTest("Object Prototype & 2 custom values >", res5, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x y")

    let fail = 5 - pass
    printResults("BASIC FUNCTIONALITY TESTS", pass, fail)
}

/**
 * tests with editing object properties
 */
function editingProperties() {
    printBeginning("PROPERTIES FUNCTIONALITY TESTS")
    let pass = 0
    
    // define an object for this suite
    let z = Object.create({x: 1})
    // redefine a value
    Object.defineProperty(z, "x", {
        configurable: false,
        writable: true
    });

    let res1 = getOutput(iterateProperties(z))
    // when a value was redefined, it should show up 2 times (orig & new)
    pass += printTest("Object Prototype & 1 custom redefinedProperty >", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x x")

    Object.defineProperty(z, "y", {
        configurable: false,
        writable: false
    });
    let res2 = getOutput(iterateProperties(z))
    // new y should also show up
    pass += printTest("Object Prototype & 2 custom definedProperty >", res2, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x x y")


    let res3 = getOutput(iterateProperties(z, {configurable: false}))
    pass += printTest("Writable descriptor filter >", res3, " x y")

    let res4 = getOutput(iterateProperties(z, {writable: false}))
    pass += printTest("Configurable descriptor filter >", res4, " y")

    // check if the .next() works as it should (it.s a generator after all)
    let iterator1 = iterateProperties({x: 1, y: 5}, {enumerable: true})
    let iterator2 = iterateProperties({y: 1, x: 1}, {enumerable: true})
    let res5 = iterator1.next().value
    pass += printTest("Two instances - inst one - 1 >", res5, "x")
    let res6 = iterator2.next().value
    pass += printTest("Two instances - inst two - 1 >", res6, "y")
    let res7 = iterator2.next().value
    pass += printTest("Two instances - inst two - 2 >", res7, "x")
    let res8 = iterator1.next().value
    pass += printTest("Two instances - inst one - 2 >", res8, "y")
    

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
    // custom search - filter by writable: false 
    pass += printTest("Unwritable >", res1, " x")

    // custom search by value
    let res2 = getOutput(iterateProperties(z, {value: 5}))
    pass += printTest("Value-5 >", res2, " x")

    let res3 = getOutput(iterateProperties({}, {writable: true}))
    pass += printTest("Writable Object prototype >", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")

    let res4 = getOutput(iterateProperties({}, {configurable: false}))
    pass += printTest("Unconfigurable Object Prototype >", res4, "")

    // empty custom filter acts as if there was none at all
    let res5 = getOutput(iterateProperties({x: 1}, {}))
    pass += printTest("Empty filter >", res5, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString x")

    // search by a descriptor that doesnt exist should return nothing (cuz nothing matches)
    let res6 = getOutput(iterateProperties({}, {something_new: true}))
    pass += printTest("Undefined property descriptor >", res6, "")

    // search by a descriptor that doesnt exist and something that exists should return nothing (cuz nothing matches the first one)
    let res7 = getOutput(iterateProperties({}, {something_new: true, writable: false}))
    pass += printTest("Undefined property descriptor & defined desc at the same time >", res7, "")

    let fail = 7 - pass
    printResults("ADVANCED PROPERTIES FUNCTIONALITY TESTS", pass, fail)
}

/**
 * tests using multiple filters at the same time
 */
function multipleFilters() {
    printBeginning("MULTIPLE FILTERS TESTS")
    let pass = 0

    // multiple descriptors in custom filter at once (both valid) should return those that fulfill
    let res1 = getOutput(iterateProperties({}, {writable: true, enumerable: false}))
    pass += printTest("{} - filter writable & not enumerable >", res1, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")

    let res2 = getOutput(iterateProperties({}, {writable: true, enumerable: false, configurable: false}))
    pass += printTest("{} - filter writable & not enumerable & not ocnfigurable >", res2, "")

    let res3 = getOutput(iterateProperties({}, {writable: true, enumerable: false, configurable: true}))
    pass += printTest("{} - filter writable & not enumerable & ocnfigurable >", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf toLocaleString")


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
    pass += printTest("2 custom properties multiple filters >", res4, " x y")

    let res5 = getOutput(iterateProperties(z, {enumerable: false, value: 5}))
    pass += printTest("Not enumerable & value filters >", res5, " x y")

    let fail = 5 - pass
    printResults("MULTIPLE FILTERS TESTS", pass, fail)
}

/**
 * Tests focusing on advanced constructs (prototype of a function & class)
 */
function advancedConstructs() {
    printBeginning("ADVANCED CONSTRUCTS TESTS")
    let pass = 0

    function smth(x) {
        this.val = x;
    }
    smth.prototype = {
        val: 5,
    }

    // function has a prototype which defines `val` and therefore there should `val` 2 times
    let res1 = getOutput(iterateProperties(new smth(4), {enumerable: true}))
    pass += printTest("Function & prototype >", res1, " val val")

    function smth2(x) {
        this.val = x;
    }

    // function without an explicit prottype should only have 1 `val`
    let res2 = getOutput(iterateProperties(new smth2(4), {enumerable: true}))
    pass += printTest("Function & prototype 2 >", res2, " val")

    let res3 = getOutput(iterateProperties(new smth2(4)))
    pass += printTest("Function & prototype 3 >", res3, " constructor __defineGetter__ __defineSetter__ hasOwnProperty __lookupGetter__ __lookupSetter__ isPrototypeOf propertyIsEnumerable toString valueOf __proto__ toLocaleString constructor val")

    class smthClass {
        x;
        y;
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
    }

    // members of class should show up
    let res4 = getOutput(iterateProperties(new smthClass(1,2), {enumerable: true}))
    pass += printTest("Class 1 >", res4, " x y")

    // members of class when constructor doesnt have enough values - they shoudl still show up
    let res5 = getOutput(iterateProperties(new smthClass(), {enumerable: true}))
    pass += printTest("Constructor without parameters >", res5, " x y")

    class smth2Class {
        x;
    }

    // class without explicit constructor should still show member
    let res6 = getOutput(iterateProperties(new smth2Class(), {enumerable: true}))
    pass += printTest("No constructor >", res6, " x")


    let fail = 6 - pass
    printResults("ADVANCED CONSTRUCTS TESTS", pass, fail)
}

// launch all the tests
basicFunctionality()
editingProperties()
advancedProperties()
multipleFilters()
advancedConstructs()
printResults("ALL TOGETHER:", totalPass, totalFail)
