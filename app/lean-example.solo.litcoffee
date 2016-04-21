
# Lean Example webLurch Application

## Overview

To know what's going on here, you should first have read the documenation
for [the simple example application](simple-example.solo.litcoffee) and then
for [the complex example application](complex-example.solo.litcoffee).
This application is more useful than either of those.

    setAppName 'LeanApp'
    addHelpMenuSourceCodeLink 'app/lean-example.solo.litcoffee'

[See a live version of this application online here.](
http://nathancarter.github.io/weblurch/app/lean-example.html)

## Utilities for timing things

    myTimer = null
    now = -> ( new Date ).getTime()
    startTimer = -> myTimer = now()
    checkTimer = -> "(took #{now() - myTimer} ms)"

## Lean VM Setup

Here we begin loading the Lean virtual machine.  This takes some time.  We
do it silently, but we leave several commented-out `console.log` statements
below, so that you can see where certain events take place, and can monitor
those events on the console if you like, by uncommenting those lines.

The global variable `LeanOutputObject` is the current (if still under
construction) or most recent (if just completed) object dumped by the Lean
VM on its standard output channel.  The global variable `LeanOutputArray` is
the ordered collection of all such output objects, in the order they were
produced.

    # console.log( '--- Loading Lean VM...' );
    Module = window.Module = { }
    Module.TOTAL_MEMORY = 64 * 1024 * 1024
    Module.noExitRuntime = true
    LeanOutputObject = null
    LeanOutputArray = null
    Module.print = ( text ) ->
        match = null
        if match = /FLYCHECK_BEGIN (.*)/.exec text
            LeanOutputObject = type : match[1], text : [ ]
        else if not LeanOutputObject
            throw new Error 'Unexpected output from Lean: ' + text
        else if match = /([^:]+):(\d+):(\d+): (.*)/.exec text
            LeanOutputObject.file = match[1]
            LeanOutputObject.line = match[2]
            LeanOutputObject.char = match[3]
            LeanOutputObject.info = match[4]
        else if /FLYCHECK_END/.test text
            # console.log 'Lean output: ' \
            #           + JSON.stringify LeanOutputObject, null, 4
            LeanOutputArray.push LeanOutputObject
            LeanOutputObject = null
        else
            LeanOutputObject.text.push text
    Module.preRun = [
        ->
            # console.log '--- Lean VM loaded.', checkTimer()
            # console.log '--- Running Lean VM...'
            # startTimer()
    ]
    # Module.postRun = ->
    #     console.log '--- Lean VM has been run.', checkTimer()

## Lean Engine

The following function runs the Lean engine on a string input, treating that
string as an entire input file (with line and column numbers, as if Lean
were being run from the command line, not the web).  All feedback and/or
error messages produced by the engine are converted into output objects by
the `Module.print` function, above, and collected into the global variable
`LeanOutputArray`, which this function then returns.

    runLeanOn = window.runLeanOn = ( code ) ->
        # console.log '--- Calling lean_init()...'
        # startTimer()
        Module.lean_init false
        # console.log '--- lean_init() complete.', checkTimer()
        # console.log '--- Importing Lean standard module...'
        # startTimer();
        Module.lean_import_module "standard"
        # console.log '--- Standard module imported.', checkTimer()
        # console.log '--- Writing test.lean to virtual FS...'
        # startTimer()
        # console.log code
        FS.writeFile 'test.lean', code, encoding : 'utf8'
        # console.log '--- test.lean written.', checkTimer()
        # console.log '--- Running Lean on test.lean...'
        # startTimer()
        LeanOutputArray = [ ]
        Module.lean_process_file 'test.lean'
        # console.log '--- Lean has been run on test.lean.', checkTimer()
        LeanOutputArray

## Validation

To track whether validation is running, we use a global boolean.

    validationRunning = no

We also create a few functions for marking a group valid or invalid, for
clearing or checking whether a group has validation information, and for
clearing all validation information so that a new run of validation can then
operate on a clean slate.

    setValidity = ( group, symbol, hoverText ) ->
        group.set 'closeDecoration', symbol
        group.set 'closeHoverText', hoverText
    markValid = ( group, validOrNot, message ) ->
        color = if validOrNot then 'green' else 'red'
        symbol = if validOrNot then '&#10003;' else '&#10006;'
        setValidity group, "<font color='#{color}'>#{symbol}</font>",
            message
    clearValidity = ( group ) ->
        group.clear 'closeDecoration'
        group.clear 'closeHoverText'
    hasValidity = ( group ) ->
        'undefined' isnt typeof group.get 'closeDecoration'
    clearAllValidity = ->
        if validationRunning then return
        validationRunning = yes
        groups = tinymce.activeEditor.Groups
        clearValidity groups[id] for id in groups.ids()
        validationRunning = no

Now, the validation routine that operates on the whole document at once.  It
presumes that you have just run `clearAllValidity()`.

    validate = window.validate = ->
        groups = tinymce.activeEditor.Groups

If validation is running, then this call is probably the result of
recursion.  That is, changes to the document that happen during validation
are attempting to re-start validation in response to those changes.  They
should be ignored.

        if validationRunning then return
        validationRunning = yes

For any term group whose parent is also a term group, mark it invalid for
that reason.

        for id in groups.ids()
            if groups[id].typeName() is 'term' and \
               groups[id].parent?.typeName() is 'term'
                markValid groups[id], no,
                    'A term group cannot be inside another term group.'

Compute the Lean code for the entire document.  (This routine is defined
later in this file.)  We then create a mapping from lines in that file to
group IDs that generated those lines, so that we can trace errors back to
their origins.

        lineToGroupId = { }
        for line, index in ( leanCode = documentToCode() ).lines
            if m = /[ ]--[ ](\d+)$/.exec line
                lineToGroupId[index + 1] = parseInt m[1]

Run Lean on that input and process all output.

        lastError = -1
        for message in runLeanOn leanCode.lines.join '\n'
            id = lineToGroupId[message.line]
            if isError = /error:/.test message.info then lastError = id
            detail = "Lean reported:\n\n#{message.info}"
            if message.text.length
                detail += '\n' + message.text.join '\n'
            citation = parseInt message.char
            citation = if citation > 0
                codeline = leanCode.lines[message.line - 1]
                "\n\ncharacter ##{citation + 1} in this code:
                 \n#{/^(.*) -- \d+$/.exec( codeline )[1]}"
            else
                ''
            markValid groups[id], not isError, detail + citation
        for id in groups.ids()
            if id is lastError then break
            if not hasValidity groups[id]
                markValid groups[id], yes, 'No errors reported.'

Any type groups without arrows to term groups must be marked with a message
to tell the user that they were not part of validation (and perhaps indicate
a mistake on the user's part in input).

        for id in groups.ids()
            if groups[id].typeName() is 'type'
                modifiedTerms = ( connection[1] \
                    for connection in groups[id].connectionsOut() \
                    when groups[connection[1]].typeName() is 'term' )
                if modifiedTerms.length is 0
                    setValidity groups[id],
                        '<font color="#aaaa00"><b>&#10039;</b></font>',
                        'This type does not modify any terms, and was thus
                        ignored in validation.  Did you mean to connect it
                        to a term?'

Also mark invalid any group that couldn't be converted to Lean code in the
first place.

        for id, message in leanCode.errors
            markValid groups[id], no, message

Validation is complete.

        validationRunning = no

Add a validate button to the toolbar.  It disables itself and shows
alternate text while Lean is running, because that process is time-consuming
and therefore needs some visual cue for the user about its progress.  We use
the zero timeout below to ensure that the UI is updated with the
"Running..." message before it locks up during the Lean run.

    validateButton = null
    window.groupToolbarButtons.validate =
        text : 'Run Lean'
        tooltip : 'Run Lean on this document'
        onclick : ->
            validateButton.text 'Running...'
            validateButton.disabled yes
            setTimeout ->
                validate()
                validateButton.disabled no
                validateButton.text 'Run Lean'
            , 0
        onPostRender : -> validateButton = this

## Lean Commands

The following Lean commands are permissible on terms.  Each comes with a
format for how it is converted into a line of Lean code.

    leanCommands =
        check : 'check (TERM)'
        eval : 'eval (TERM)'
        print : 'print "TERM"'
        import : 'import TERM'
        open : 'open TERM'
        constant : 'constant TERM'
        variable : 'variable TERM'
        definition : 'definition TERM'
        theorem : 'theorem TERM'
        example : 'example TERM'

## Term Groups

Declare a new type of group in the document, for Lean terms.

    window.groupTypes = [
        name : 'term'
        text : 'Lean Term'
        tooltip : 'Make the selection a Lean term'
        color : '#666666'
        imageHTML : '<font color="#666666"><b>[ ]</b></font>'
        openImageHTML : '<font color="#666666"><b>[</b></font>'
        closeImageHTML : '<font color="#666666"><b>]</b></font>'
        contentsChanged : clearAllValidity

Its tag will advertise any Lean command embedded in the group.

        tagContents : ( group ) ->
            if command = group.get 'leanCommand'
                "command: #{command}"
            else
                null

Its context menu permits adding, editing, or removing a Lean command
embedded in the group.

        contextMenuItems : ( group ) -> [
            text : 'Edit command...'
            onclick : ->
                newval = prompt 'Enter the Lean command to use on this code
                    (or leave blank for none).\n
                    \nValid options include:\n' + \
                    Object.keys( leanCommands ).join( ' ' ),
                    group.get( 'leanCommand' ) ? ''
                if newval isnt null
                    if newval is ''
                        group.clear 'leanCommand'
                    else if newval not of leanCommands
                        alert 'That was not one of the choices.  No change
                            has been made to your document.'
                    else
                        group.set 'leanCommand', newval
        ]

When drawing term groups, draw all arrows that come in or go out.  (The
default is to only draw arrows that go out; we override that here, so that a
term's type is clearly highlighted when the term is highlighted.)

        connections : ( group ) ->
            outs = group.connectionsOut()
            ins = group.connectionsIn()
            [ outs..., ins...,
              ( t[1] for t in outs )..., ( t[0] for t in ins )... ]
        # tagMenuItems : ( group ) -> ...compute them here...
    ]

The following function computes the meaning of a top-level Term Group in the
document.

    termGroupToCode = window.termGroupToCode = ( group ) ->

If the group contains any other group, have the result be the empty string,
because that structure is invalid.

        if group.children.length > 0
            throw Error 'Invalid structure: Term groups may not contain
                other groups'

Start with the group's contents, as text.  This can be something as simple
as `1` for a term for the number one, or as complex as an entire proof
object, written in Lean syntax (e.g., `(assume H : p, ...big proof...)`).

        term = group.contentAsText().trim()

Determine if there exists a unique type group modifying this group.  (If
there is more than one type group, throw an error.)

        assignedTypes = [ ]
        for connection in group.connectionsIn()
            source = tinymce.activeEditor.Groups[connection[0]]
            if source.typeName() is 'type'
                type = source.contentAsText().trim()
                if type not in assignedTypes then assignedTypes.push type
        if assignedTypes.length > 1
            throw Error "Invalid structure: Two different types are assigned
                to this term (#{assignedTypes.join ', '})"

If we've found a unique type, insert it after the first identifier, or after
the end of the whole term.  For example, if the term were `a := b` we would
create `a : type := b`, but if it were `(and.intro H1 H2)` then we would
create `(and.intro H1 H2) : type`.

        if assignedTypes.length > 0
            type = assignedTypes[0]
            if match = /^\s*check\s+(.*)$/.exec term
                term = "check (#{match[1]} : #{type})"
            else if match = /^\s*check\s+\((.*)\)\s*$/.exec term
                term = "check (#{match[1]} : #{type})"
            else if match = /^([a-zA-Z0-9_]+)(.*)$/.exec term
                rest = if match[2] isnt '' then " #{match[2]}" else ''
                term = "#{match[1]} : #{type}#{rest}"
            else
                term = "#{term} : #{type}"

Prepend any Lean command embedded in the group.

        if command = group.get 'leanCommand'
            term = leanCommands[command].replace 'TERM', term

Append a one-line comment character, followed by the group's ID, to track
where this line of code came from in the document, for the purposes of
transferring Lean output back to this group as user feedback.

        "#{term} -- #{group.id()}"

The following function converts the document into Lean code by calling
`termGroupToCode` on all top-level term groups in the document.  If this
array were joined with newlines between, it would be suitable for passing
to Lean.

    documentToCode = window.documentToCode = ->
        result = lines : [ ], errors : { }
        for group in tinymce.activeEditor.Groups.topLevel
            continue unless group.typeName() is 'term'
            try
                result.lines.push termGroupToCode group
            catch e
                result.errors[group.id] = e.message
        result

## Type Groups

Declare a new type of group in the document, for Lean types.

    window.groupTypes.push
        name : 'type'
        text : 'Lean Type'
        tooltip : 'Make the selection a Lean type'
        color : '#66bb66'
        imageHTML : '<font color="#66bb66"><b>[ ]</b></font>'
        openImageHTML : '<font color="#66bb66"><b>[</b></font>'
        closeImageHTML : '<font color="#66bb66"><b>]</b></font>'
        contentsChanged : clearAllValidity
        connectionRequest : ( from, to ) ->
            if to.typeName() isnt 'term' then return
            if to.id() in ( c[1] for c in from.connectionsOut() )
                from.disconnect to, 'type'
            else
                from.connect to, 'type'

Install the arrows UI so that types can connect to terms.

    window.useGroupConnectionsUI = yes

## Body Groups

Declare a new type of group in the document, for the bodies of definitions,
theorems, examples, sections, and namespaces.

    window.groupTypes.push
        name : 'body'
        text : 'Body of a Lean definition or section'
        tooltip : 'Make the selection a body'
        color : '#6666bb'
        imageHTML : '<font color="#6666bb"><b>[ ]</b></font>'
        openImageHTML : '<font color="#6666bb"><b>[</b></font>'
        closeImageHTML : '<font color="#6666bb"><b>]</b></font>'
        contentsChanged : clearAllValidity
        connectionRequest : ( from, to ) ->
            if to.typeName() isnt 'term' then return
            if to.id() in ( c[1] for c in from.connectionsOut() )
                from.disconnect to, 'type'
            else
                from.connect to, 'type'
