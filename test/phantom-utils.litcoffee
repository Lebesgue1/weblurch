
# Utilities useful to the testing suite

The compiled app runs in a web browser, so this module provides utility
functions for dealing with the headless browser
[PhantomJS](http://phantomjs.org/) for use in automated testing. This is
done through a bridge from [node.js](http://nodejs.org/) to PhantomJS,
called [node-phantom-simple](
https://npmjs.org/package/node-phantom-simple).

    nps = require 'node-phantom-simple'

# The main API, `phantomDescribe`

The `phantomDescribe` function makes it easy to set up a PhantomJS instance
and load into it a page from a given URL.  If any errors take place during
the loading process, they are thrown as exceptions, or recorded as
attributes of the page object.
 * `page.reserr` will be a resource error object, if there was a resource
   error
 * `page.err` will be a generic error object, if there was a generic error

This can easily be used within the asynchronous test framework in
[Jasmine](http://jasmine.github.io/) by replacing a call to Jasmine's
`describe` function with a call to `phantomDescribe`. An example appears
[further below](#example).

# Private API

Here is a global variable in which I store the one PhantomJS instance I
create.  (Creating many PhantomJS instances leads to errors about too many
listeners for an `EventEmitter`, so I use one global PhantomJS instance.)
It starts uninitialized, and I prove a function for querying whether it has
been initialized since then.

    P = phantom: null, page: null
    phantomInitialized = -> P?.phantom and P?.page

This function loads into that global instance any given URL. It does not
check `phantomInitialized` first; that is the business of the next function,
below. Once the URL is loaded, this function calls the given callback.

It sets `P.page` to be false before the page opening is attempted, and sets
it to true if the opening complets without error.

    loadURLInPhantom = ( url, callback ) ->
        P.page.loaded = no
        P.page.open url, ( err, status ) ->
            if err then console.log err ; throw err
            P.page.loaded = yes
            callback()

This function initializes the global variable `P`, loads the given URL into
the page stored in that global variable, and then calls a callback function.
If `P` was already initialized, then this just calls the callback.

    initializePhantom = ( url, callback ) ->
        if phantomInitialized()
            loadURLInPhantom url, callback
        else
            nps.create ( err, ph ) ->
                if err then console.log err ; throw err
                P.phantom = ph
                P.phantom.createPage ( err, pg ) ->
                    if err then console.log err ; throw err
                    P.page = pg
                    P.page.onResourceError = ( err ) ->
                        console.log 'Page resource error:', err
                        P.page.reserr = err
                    P.page.onError = ( err ) ->
                        console.log 'Page error:', err
                        P.page.err = err
                    P.page.onConsoleMessage = ( message ) ->
                        console.log message
                    loadURLInPhantom url, callback

# Public API

And now we define the one function this module exports, which will
initialize the members of `P` if and when needed.

    exports.phantomDescribe = ( text, url, tests ) ->
        describe text, ->

Before each test, load the given page into the headless browser and be sure
it loaded successfully.

            beforeEach ( done ) -> initializePhantom url, done

Run the tests that the user passed in as a function. Provide the user the
`phantom` and `page` objects from earlier as attributes of the `this` object
when `tests` is run. Thus they can access them as `@phantom` and `@page`.

            tests.apply P

# Example

Example use (note the very important `=>` for preserving `this`):

    # phantomDescribe 'My page', './index.html', ->
    #     it 'must load', ( done ) =>
    #         expect( @page.loaded ).toBeTruthy()
    #         done()

# Running test app histories

Load [the testapp page](../testapp/index.html) and execute in it all the
commands contained in the JSON data stored in the given file.  After each
command, if the recorded state of the editor is marked as correct (or
incorrect) in the JSON data, test to verify that the result in the page
equals (or does not equal) that recorded state.

The return value is the loaded JSON test history, because the caller
accumulates all such test histories into one big data structure, for use in
[the test app](../testapp/index.html).

    exports.runTestHistory = ( filename ) ->
        testHistory = null

Start a test for the given filename, whether or not it even exists.

        exports.phantomDescribe "Test history in #{filename}", \
        './testapp/index.html', ->

The first test it must pass is that the file must exist and be readable as
the JSON data for an array.

            fs = require 'fs'
            canLoad = yes
            try
                testHistory = JSON.parse fs.readFileSync filename
            catch error
                canLoad = error
            it 'exists on disk', ( done ) =>
                expect( canLoad ).toEqual yes
                done()
            it 'contains a JSON array', ( done ) =>
                expect( testHistory instanceof Array ).toBeTruthy()
                done()

Now we re-run, in the page, the entire test history.

            it 'was correctly replayed (in full)', ( done ) =>
                @page.evaluate ( history ) ->
                    result = []
                    for step, index in history

For each step, if there is code to run (i.e., it's not the initialization
step) then run it and be sure there are no errors. We include the index in
the output so that if a test fails later, it will be obvious which step of
the test failed.

                        if step.code.length > 0
                            try
                                eval step.code
                                result.push \
                                    "no error in command #{index}"
                            catch error
                                result.push error
                        else
                            result.push \
                                "no error in command #{index}"

Now in case there is any comparison to do with the main div's state, we
record that state here as a JSON string.

                        result.push LE.getElement().toJSON()
                    result
                , ( err, result ) ->

Now we repeat the same loop through the test history after we've obtained
the page results, and verify that they're what they should be.  The first
two lines pick out the two relelvant elements from the results array, one
the result of running any code at that step and the other the DOM state
achieved by that code.

                    for step, index in testHistory
                        codeResult = result[index*2]
                        state = result[index*2+1]

Verify that no errors occurred when the code ran.

                        expect( codeResult ).toEqual \
                            "no error in command #{index}"

Now, in case one of the tests below fails, we'll want its index in the
output, so we place that index in the objects here, just as a convenience to
the reader.

                        state.index = step.state.index = index

Verify that the states match or do not match, whichever the test data
requires.

                        if step.correct is yes
                            expect( state ).toEqual step.state
                        else if step.correct is no
                            expect( state ).not.toEqual step.state
                    done()

This is the additional (optional) parameter passed to the function that
`@page.evaluate` will run, the test history as a big, JSONable object.

                , testHistory

Return the test history, as described in the documentation above the
function signature, above.

        testHistory

# Convenience function for tests

In order to make writing tests shorter, we provide the following convenience
function.  Consider the following idiom.

    # it 'name of test here', ( done ) =>
    #     @page.evaluate =>
    #         result = []
    #         result.push( statement1 we want to test )
    #         result.push( statement2 we want to test )
    #         result.push( statement3 we want to test )
    #         result
    #     , ( err, result ) ->
    #         expect( err ).toBeNull()
    #         expect( result[0] ).toBeSuchAndSuch()
    #         expect( result[1] ).toBeSuchAndSuch()
    #         expect( result[2] ).toEqual soAndSo
    #         done()

This pattern would appear throughout our testing suite, and thus can be made
shorter by defining the following functions.  This one can be used as in the
example below to store the `done` function in the global object `P` for
later use.

    exports.inPage = ( func ) ->
        ( done ) ->
            P.done = done
            func()

This one can be used in place of `expect` to provide the extra checks we
desire, and cause `done` to be called for us.  Note that the default value
for `check` enables the idiom `pageExpects -> expression` as a shortcut for
`pageExpects ( -> expression ), 'toBeTruthy'`.

    exports.pageExpects =
    ( func, check = 'toBeTruthy', args... ) ->
        setErrorPoint()
        P.page.evaluate ( evaluateThis ) ->
            result = try eval evaluateThis catch e then e
            if typeof result is 'undefined'
                result = [ 'undefined' ]
            else if result is null
                result = [ 'null' ]
            else
                result = [ 'value', result ]
            result
        , ( err, result ) ->
            expect( err ).toBeNull()
            if result?[0] is 'null'
                result = null
            else if result?[0] is 'value'
                result = result[1]
            else
                result = undefined
            if typeof result isnt 'undefined'
                expect( result )[check](args...)
            else
                expect( undefined )[check](args...)
            P.done()
        , "(#{func.toString()})()"

The new idiom that can replace the old is therefore the following.

    # it 'name of test here', inPage ->
    #     pageExpects ( -> statement1 we want to test ),
    #         'toBeSuchAndSuch'
    #     pageExpects ( -> statement2 we want to test ),
    #         'toBeSuchAndSuch'
    #     pageExpects ( -> statement3 we want to test ),
    #         'toEqual', soAndSo

If you expect an error, you can do so with this routine.  The `check` and
`args` parameters are optional, and will be used on the error object (if one
exists) if and only if they're provided.

    exports.pageExpectsError = ( func, check, args... ) ->
        setErrorPoint()
        P.page.evaluate ( evaluateThis ) ->
            try eval evaluateThis ; null catch e then e
        , ( err, result ) ->
            expect( err ).toBeNull()
            expect( result ).not.toBeNull()
            if check then expect( result.message )[check](args...)
            P.done()
        , "(#{func.toString()})()"

Use it as per the following examples.

    # it 'name of test here', inPage ->
    #     pageExpectsError ( -> undefinedVar )
    #     pageExpectsError ( -> foo('hello') ),
    #         'toMatch', /parameter must be an integer/

Furthermore, if some setup code needs to be run in the page, which does not
require any tests to be called on it, but still needs to run without errors,
then the following may be useful.

    exports.pageDo = ( func ) ->
        P.page.evaluate func, ( err, result ) ->
            expect( err ).toBeNull()
            P.done()

One can then do the following.

    # it 'name of test here', inPage ->
    #     pageDo ->
    #         ...put a lot of code here, and if assigning to any
    #         variables, be sure to use window.varName...
    #     pageExpects ( -> back to more tests here ),
    #         'toBeTruthyOrWhatever'

# Jasmine modifications

The `pageExpects` and `pageExpectsError` functions, above, make asynchronous
calls to `page.evaluate` and then perform `expect` calls in the callback.
The problem with this is that if any of the tests in the `expect` calls
fails, the traceback used to report the error location will have the wrong
call stack.  It will be the call stack for the callback, which will usually
come from a `node.js` timer function, rather than the caller of the
`pageExpects` function, for instance.  This makes it very hard to track down
the errors, and is thus undesirable.

To fix this problem, we make some modifications to the Jasmine API, so that
we can set the stack trace before the asynchronous code begins, and that
stack trace will be used in later error reports.

First, we provide a function that can be used to set the stack trace.

    setErrorPoint = ->
        spec = jasmine?.getEnv().currentSpec
        if not spec
            throw Error 'No current spec in which to
                set error point'

When we create a new stack trace, we remove from it the mention of this
function (`setErrorPoint`) and the one that called it (which will be
`pageExpects`, above).

        stack = ( new Error() ).stack.split '\n'
        stack = [ stack[0] ].concat stack[3..]
        spec.overrideStack_ = stack.join '\n'

Second, we wrap the `addMatcherResult` function in `jasmine.Spec` with a
"before" clause that looks up the data stored above and uses it, if it's
present, to overwrite any existing error stack.

    oldFn = jasmine.Spec.prototype.addMatcherResult
    jasmine.Spec.prototype.addMatcherResult = ( result ) ->
        if @overrideStack_ and result.passed_ is no
            result.trace.stack = @overrideStack_
        oldFn.apply this, [ result ]
