
# OpenMath Content Dictionary Example webLurch Application

## Overview

To know what's going on here, you should first have read the documenation
for [the simple example application](simple-example.solo.litcoffee) and then
for [the complex example application](complex-example.solo.litcoffee).
This application is more useful than either of those.

    setAppName 'OM-CD-Writer'
    window.menuBarIcon = { }

[See a live version of this application online here.](
http://nathancarter.github.io/weblurch/app/openmath-example.html)

## Define one group type

For information on what this code does, see the simple example linked to
above.  At present this file is a stub, so nothing special happens here yet.

    window.groupTypes = [

Basic appearance attributes for the group:

        name : 'tag'
        text : 'Content Dictionary Tag'
        tooltip : 'Tag the selection'
        imageHTML : '<font color="#999999">{}</font>'
        openImageHTML : '<font color="#999999">{</font>'
        closeImageHTML : '<font color="#999999">}</font>'

The very important content changed event handler:

        contentsChanged : ( group, firstTime ) ->

If the group has just come into existence, we must check to see what its
default tag type should be, and initialize it to that default.  We must do
this on a delay, because when `firstTime` is true, the group does not even
yet have its parent pointer set.

            if firstTime
                setTimeout ( -> window.initializeGroupTag group ), 0

The tag name for a group is what shows up in its bubble tag.

        tagContents : ( group ) ->
            window.getTagExternalName group.get 'tagName'

A group's tag menu and its context menu will be the same.  They are both
generated by the `XMLMenuItems` function defined in
[the XML Groups module](../src/xml-groups.solo.litcoffee).

        tagMenuItems : ( group ) -> window.XMLMenuItems group
        contextMenuItems : ( group ) -> window.XMLMenuItems group
    ]

## Define the XML tags for this application

Much of the documentation herein was taken directly from [the OpenMath
Specification version 2.0](http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf), with
slight rewordings to suit this particular application.

    window.setTagData
        CD :
            externalName : 'Content Dictionary'
            topLevel : yes
            defaultChild : 'Description'
            includeText : 'CDComment'
        Description :
            documentation : '<p>The text occurring in the Description
                element is used to give a description of the enclosing
                element, which could be a symbol or the entire Content
                Dictionary.  The content of this element can be any XML
                text.</p>
                <p>Within the whole Content Dictionary, this element is
                optional, but should come before any other elements of the
                Content Dictionary.  There can be at most one description
                for a Content Dictionary.</p>
                <p>Within a Content Dictionary Definition, this element is
                required, and follows the Name and optional Role.  There
                must be exactly one description for a Content
                Dictionary Definition.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD', 'CDDefinition' ]
        CDComment :
            externalName : 'Content Dictionary Comment'
            documentation : '<p>This tag will not actually be used in
                authoring, but will be automatically wrapped around any
                top-level text in the document when XML is generated.</p>'
        CDName :
            externalName : 'Content Dictionary Name'
            documentation : '<p>The name of the Content Dictionary.  This
                will be the "cd" field of all symbols from this Content
                Dictionary.  For example, standard addition comes from the
                Content Dictionary "arith1".  It must comply to the rules
                in Section 2.3 of <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a>.</p>
                <p>This element is required in a Content Dictionary, and
                must either be the first element or immediately after the
                optional description.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDURL :
            externalName : 'Content Dictionary URL'
            documentation : '<p>The text occurring in the CDURL element
                should be a valid URL where the source file for the Content
                Dictionary encoding can be found (if it exists). The
                filename should conform to <a href="http://www.iso.org/iso/en/CatalogueDetailPage.CatalogueDetail?CSNUMBER=17505">ISO 9660</a>.</p>
                <p>This element is optional, but if present, there must be
                only one and it must immediately follow the Content
                Dictionary Name element.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDBase :
            externalName : 'Content Dictionary Base'
            documentation : '<p>A Content Dictionary Base, when combined
                with the Content Dictionary Name, forms a unique identifier
                for the Content Dictionary.  It may or may not refer to an
                actual location from which it can be retrieved.</p>
                <p>This element is optiona, but if present, there must be
                only one and it must immediately follow the Content
                Dictionary Name and optional URL.</p>
                <p>For example, standard addition comes from the
                content dictionary "arith1" with base
                "http://www.openmath.org/cd".  It is also the case that
                you can find that Content Dictionary file online at
                <a href="http://www.openmath.org/cd/arith1.xhtml">http://www.openmath.org/cd/arith1.xhtml</a>,
                but it is not required that the base be a URL.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDUses :
            externalName : 'Content Dictionaries Used herein'
            documentation : '<p>The content of this element should be a
                series of Content Dictionary Name elements, each naming a
                Content Dictionary used in the Example and Mathematical
                Properties of the current Content Dictionary.  This element
                is optional and deprecated since the information can easily
                be extracted automatically.</p>
                <p>If present, there can be only one of these elements, and
                it must immediately follow the Content Dictionary
                Status.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDReviewDate :
            externalName : 'Content Dictionary Review Date'
            documentation : '<p>A review date is a date until which the
                content dictionary is guaranteed to remain unchanged.  Dates
                should be written in the ISO-compliant format YYYY-MM-DD,
                e.g. 1966-02-03.</p>
                <p>This element is optional.  If present, there can be only
                one, and it must follow the Content Dictionary Name and
                optional URL and Base URL.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDStatus :
            externalName : 'Content Dictionary Status'
            documentation : '<p>The status of the Content Dictionary, which
                must be one of the following four words.</p>
                <ul>
                <li><b>official:</b> approved by the OpenMath Society
                according to the procedure outlined in Section 4.5 of
                <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></li>
                <li><b>experimental:</b> under development and thus liable
                to change</li>
                <li><b>private:</b> used by a private group of OpenMath
                users</li>
                <li><b>obsolete:</b> an obsolete Content Dictionary kept
                only for archival purposes</li>
                </ul>
                <p>This element is required in a Content Dictionary, and
                there must be only one, and it must follow the Content
                Dictionary Date.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDDate :
            externalName : 'Content Dictionary Date'
            documentation : '<p>A revision date, the date of the last change
                to the Content Dictionary. Dates should be written in the
                ISO-compliant format YYYY-MM-DD, e.g. 1966-02-03.</p>
                <p>This element is required in any Content Dictionary.
                There must be exactly one, and it must immediately follow
                the Content Dictionary Name and optional URL, Base, and
                Review Date.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDVersion :
            externalName : 'Content Dictionary Version'
            documentation : '<p>A version number must consist of two parts,
                a major version and a revision, both of which should
                be non-negative integers.  In Content Dictionaries that do
                not have status experimental, the version number should
                be a positive integer.</p>
                <p>This field stores the major version.  Use a Content
                Dictionary Revision to store the other half of the version
                number.</p>
                <p>This element is required in any Content Dictionary.
                There must be exactly one, and it must immediately follow
                the Content Dictionary Status and optional Uses element.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDRevision :
            externalName : 'Content Dictionary Revision'
            documentation : '<p>A version number must consist of two parts,
                a major version and a revision, both of which should
                be non-negative integers.  In Content Dictionaries that do
                not have status experimental, the version number should
                be a positive integer.</p>
                <p>This field stores the revision.  Use a Content
                Dictionary Version to store the other half of the version
                number.</p>
                <p>This element is required in any Content Dictionary.
                There must be exactly one, and it must immediately follow
                the Content Dictionary Version.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
        CDDefinition :
            defaultChild : 'Description'
            documentation : '<p>This element contains the definition of an
                individual symbol in the Content Dictionary.  It should
                contain all the following.</p>
                <ul>
                <li>Name (required)</li>
                <li>Description (required)</li>
                <li>Role (optional)</li>
                <li>Zero or more Mathematical Properties</li>
                <li>Zero or more Examples</li>
                </ul>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CD' ]
            includeText : 'MathematicalProperty'
        Name :
            externalName : 'Symbol Name'
            documentation : '<p>The name of a symbol.  For example, standard
                addition comes from the Content Dictionary "arith1" and has
                the symbol name "plus".  Names must comply to the rules
                in Section 2.3 of <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a>.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CDDefinition' ]
        Role :
            externalName : 'Symbol Role'
            documentation : '<p>The role of a symbol, which indicates how
                the symbol can be used in OpenMath expressions.  It must be
                one of the following.</p>
                <ul>
                <li>binder</li>
                <li>attribution</li>
                <li>semantic-attribution</li>
                <li>error</li>
                <li>application</li>
                <li>constant</li>
                </ul>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CDDefinition' ]
        Example :
            documentation : '<p>An example should show how the symbol is
                used, to illustrate the symbol to the reader of the Content
                Dictionary.  There is no set format, other than that you may
                intersperse text and OpenMath Object as you see fit, and
                must not use any other content inside an Example.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CDDefinition' ]
        OMOBJ :
            externalName : 'OpenMath Object'
            documentation : '<p>An OpenMath Object, expressed in the XML
                encoding defined in <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a>.</p>
                <p>OpenMath Objects can be placed inside Examples to show
                how the symbol that\'s being defined might be used.  They
                can also be placed inside Mathematical Properties, to make
                them formal.</p>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CDDefinition', 'MathematicalProperty' ]
            alterXML : ( XML, group ) ->
                if window.getGroupTag( group.parent ) is 'CDDefinition'
                    XML = "<FMP>#{XML}</FMP>"
                XML
        MathematicalProperty :
            externalName : 'Mathematical Property'
            documentation : '<p>A Mathematical Property can come in one of
                two forms.</p>
                <ul>
                <li><b>Formal:</b> In this form, the content of the
                Mathematical Property should be just a single OpenMath
                Object.  Thus OpenMath is the language used to formalize
                Mathematical Properties in Content Dictionaries.</li>
                <li><b>Commented:</b> In this form, the content of the
                Mathematical Property can be any text, and can express a
                Mathematical Property in whatever informal language or
                description seems appropriate.</li>
                </ul>
                <p>Source: <a href="http://www.openmath.org/standard/om20-2004-06-30/omstd20.pdf">the OpenMath Standard version 2.0</a></p>'
            belongsIn : [ 'CDDefinition' ]
            alterXML : ( XML, group ) ->
                if XML.indexOf( '<OMOBJ>' ) > -1
                    XML.replace /MathematicalProperty>/g, 'FMP>'
                else
                    XML.replace /MathematicalProperty>/g, 'CMP>'
