---
title: "Presentation: Usenix 2025 Investigating Composable Emulation"
date: 2025-08-13T20:00:00-00:00
draft: false
categories: []
tags: ["presentation", "usenix", "emulation", "styx"]
summary: "Poster Presentation Introducing the Idea of Composable Emulation Using Styx as a Case Study"
---

Recently an intern and I got to present some of the work we've been doing (and are soon to publicly release
open source!). This poster was received very well and gave us the opportunity to chat with a lot of the
other emulation researchers (academic and commercial).

{{< pdf "/pdfs/Styx_Emulator_USENIX__25.pdf" >}}

## Popular Questions

### What Execution Backend are you Using?

Styx is the only emulation provider that lets you choose (or bring your own) execution backend.

Currently Styx packages:
- UNICORN
- a PCODE Interpreter

We are looking at adding some more options while we dial in our demands for a "Styx backend", some
of the low hanging fruit are:
- add bochs support
- add icicle-emu
- add a modern QEMU-cpu execution

Contributions welcome ;) even a "I would appreciate adding X backend" would be nice to know!

### What is Composable Emulation?

This is a common question we got at USENIX, and deserves it's own post / article. Short answer:
I made it up :) 

Composable emulation is a nice bow on top of the many shortcomings emulation tools have when
trying to use them to debug things. So far the design of emulation frameworks haven't seem to have ever really changed.
QEMU gave the world one of the most usable emulators around, and even that is really only good for
running linux or linux binaries. Or as I've started to call it "the intended use-case." From my
arbitrary definition there are currently no emulation "frameworks." I think AVATAR2 got us pretty close
though.

Emulation tools today are not built to be _tailored_ by users for their use-case.
They are instead created to fulfill the purpose of the creators (which is fine, but important
to understand how we got here).

The idea we have is to introduce a modicum of _composability_ to the emulation process, specifically
when developing for or debugging a specific target that depends on the low level target hardware
semantics. You can usually get by using the core that the generic tools like QEMU use, and hack on
the extra behavior you require for your use-case, but its not easy, and its absolutely not a
maintainable practice. Our approach allows you to add the introspection you want, the peripherals
you want etc. in a manner that solves your use-case. We still package pre-made configurations
(otherwise it wouldn't really be usable in any sense of the word), but the moment you need to
step outside the lines you can! and its well supported.

The current gap in emulation tools is a uniform interface that each component should implement,
allowing the **user** to pick and choose which parts with which implementation will be used
together. 

**Composable Emulation**

### Why not Extend _"emulator name here"_?

QEMU is particularly hostile to adding plugins, and its primary goal is to run software
fast. In the common emulation case you simply care about running software, if QEMU works, use it.

In the other case if your target is not supported or you need fine grained introspection, there
is currently no other choice. UNICORN gets the easy part out of the way and gives you flexibility and
instruction execution, with the tradeoff that you must implement all target details. Others
have started to get there (icicle-emu, meta-emu etc.), but still sit where UNICORN does without
adding much more than the "potential" for greater flexiblity.

The only other emulation framework that comes close is Renode, and that is a QEMU wrapper.
We needed a way to rapidly add new architecture support, and QEMU isn't that.

While there is absolutely a "Not Invented Here" aspect, a lot of it comes down to wanting an
environment that encourages experimentation with active developers. Bootstrapping with UNICORN
allowed us to do just that, and eventually build our own PCODE interpreter in a couple weeks
when we needed more architecture support.

### What's next?

Public Open Source Release :)

The main bottleneck with Styx at the moment is target support, there is a comfy rhythm adding
target support as needed, but the main rough point of using an emulation framework will *always*
be "does it support my target **now**?" As long as Styx has architecture support for it I hope the
answer will be "maybe, but if not it'll be easier than adding to someone else's tool."

I hope to people like it
