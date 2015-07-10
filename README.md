
# webLurch

<!--
Removing this because the tests on Travis-CI were segmentation faulting (!),
while they run without a single error on my laptop.  Will figure it out
later, but for now, I don't want it to look like we have failing tests,
when we don't, really.
[![Build status](https://travis-ci.org/nathancarter/weblurch.svg?branch=master)](https://travis-ci.org/nathancarter/weblurch)
-->

## Goal

<img src='doc/destop-lurch-icon.png'
    style='float:right;width:128px;height:128px;'>
[Lurch is a mathematical word processor](http://lurchmath.org) that checks
the reasoning in users' documents, even mathematical proofs.

*This project is rewriting Lurch for the web.*

## A Development Platform

The rewrite involves building many supporting tools that we call the *Lurch
Web Platform.*

Other developers can build math-enabled web apps on the same platform, which
improves the platform and grows the community.

We've made the architecture simple and the learning curve small.  [See the
demo applications and tutorial to start developing.](doc/tutorial.md)

## Architecture

Read the following illustration from the bottom up.

<table>
  <tr>
    <td>Applications:</td>
    <td><center>*Lurch Proof Checker*</center></td>
    <td><center>[Demo apps](doc/tutorial.md)</center></td>
    <td><center>Your app</center></td>
  </tr>
  <tr>
    <td>Platform:</td>
    <td colspan=3><center>*Lurch Web Platform*</center></td>
  </tr>
  <tr>
    <td>Foundation:</td>
    <td colspan=3><center>[TinyMCE
        editor](http://www.tinymce.com)</center></td>
  </tr>
</table>

## Status

[The *Lurch Web Platform* is ready to use.](doc/tutorial.md)  Enhancements
are ongoing.

The *Lurch Proof Checker* exists only as [a desktop
app](http://www.lurchmath.org).  It is being redesigned for implementation
on the *Lurch Web Platform*.

## Development

If you're interested in helping out with development of this project (e.g.,
upstream commits if you use the platform,) contact
[Nathan Carter](mailto:ncarter@bentley.edu).

### Repository details

All source code is in [literate
CoffeeScript](http://coffeescript.org/#literate).  This makes it highly
readable, especially on GitHub, which renders it as MarkDown.  I have tried
to be verbose in my comments, to help new readers.

A brief tour of the repository:
 * `/` (root)
   * `package.json` - used by [node.js](http://nodejs.org) to install
     dependencies  (The app runs in a browser, not node.js.  This is just
     for dev tools.)
   * `cake.litcoffee` and `buildutils.litcoffee` define the build process.
 * `app/`
   * Demo apps and the plugins that create them reside here.  You can try
     them out live on the web; see
     [the demo apps and tutorials page](doc/tutorial.md).
   * Eventually, the *Lurch Proof Checker* will be rewritten for the web and
     live in this folder.
 * `src/`
   * Source code files used for building the platform.
   * The build process compiles these into files in the `app` folder.
 * `test/`
   * Unit tests.
   * To run them, execute `cake test` in the main folder, after you've set
     it up as per [the Getting Started page](doc/getting-started.md).
