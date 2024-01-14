+++
title = "The state of Playdate in JAN 2024"
author = ["lockbox"]
date = 2024-01-14
categories = ["playdate"]
draft = false
+++

<div class="ox-hugo-toc toc">

<div class="heading">Table of Contents</div>

- [2024 Playdate](#2024-playdate)
- [Looking forward](#looking-forward)

</div>
<!--endtoc-->

The last time i messed around with the `Playdate` (~1 year ago -- [pd-platform](<https://pd-platform.lockbox.sh>)), the
OS version was `1.x`, and there was only 1 released version of the console. Now there are 2
different hardware revisions (the difference being the processor model), and the OS has
been updated to a `2.x` revision to reflect that (see [this](<https://news.play.date/news/playdate-os-2-group-4/>)
blog post).


## 2024 Playdate {#2024-playdate}

There's now a [game catalog](<https://play.date/games/>), where you can purchase games
to automatically sideload them, along with the advent of a new container file format
[supporting encryption](<https://github.com/cranksters/playdate-reverse-engineering/blob/eb67dc3b418cbd9c9473b27954ba2180e317b01a/formats/pdz.md>).
And a [new `pdex.bin` format](<https://github.com/castholm/playdate-reverse-engineering/blob/ce53c12308ed2f4fdf1945377ec3145827118fd2/formats/pdex.md>).

There have also been an uptick in memory-related issues in pd-OS / `BERNARD` if they still
call it that.

-   <https://devforum.play.date/t/c-api-sampleplayer-setsample-causing-memory-leaks/14568>
-   <https://devforum.play.date/t/clearing-image-tables-crashes-the-simulator-console/15282/2>

Also of note are some off-by-one related issues:

-   <https://devforum.play.date/t/2-2-0-launcher-discrepancy-in-launcher-cards-loopcount/15464>
-   <https://devforum.play.date/t/drawrotatedbitmap-rendering-error-when-rendering-out-of-bounds-at-specific-angles/4809/5>
-   <https://devforum.play.date/t/drawrotatedbitmap-draws-from-wrong-center-if-degrees-is-one-of-the-four-cardinal-directions/3620/10>
-   <https://devforum.play.date/t/playdate-timer-value-increases-between-calling-pause-and-start/2096/18>
-   <https://devforum.play.date/t/playdate-sprite-with-odd-dimensioned-images-drawn-off-by-1-when-x-y-position-offscreen/8312/5>

And it still looks like that there's no method for real exception handling yet.

Things that the community seem's to still be desperate for network connectivity and the open-sourcing
of the lua SDK. Though it also looks like the lua sdk is at a point where much of it is getting
turned into thin wrappers over C-routines. IMO this could be a prime candidate to provide error-handling
for developers (a la something like [this](<https://www.lua.org/pil/8.4.html>)). Though at the same time
doing that in C would probably be the way to go, because then the lua wrappers would just mirror
the reponses. Either way, a _huge_ QoL improvement would be returning errors instead of just
crashing.

All in all, it's exciting to see that the Playdate continues to have an active community and
a responsive dev team, and that the ecoystem of tools and libraries is continuing to improve.

With me now having a new hardware revision in addition to the first revision, it's time to start
hacking on the playdate again.


## Looking forward {#looking-forward}

Hopefully I'll have enough free time to check these new pieces of the Playdate out:

-   documenting the new `pdex.bin` file format w some examples
-   making some bindings to available userspace code outside of the SDK
-   moving all my tooling to ghidra (I am not a fan of the Binary Ninja file loaders and its annoying to dev on, with little room for real testing of loader plugin code)
-   finish documenting firmware update process (realistically ill probably have to restart)
