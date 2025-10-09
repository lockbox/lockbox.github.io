---
title: "Why Styx in 2025"
date: 2025-10-09T00:00:00-04:00
draft: false
categories: []
tags: ["styx", "rehosting", "emulation", "comparison"]
summary: "Addressing some questions about why introduce yet another framework for emulation and rehosting"
---

**TLDR**; Styx exists to address the lack of support other frameworks provide, particularly in the 
legacy DSP/embedded scene and when dealing with non-linux/mainstream operating systems.

## Feedback since the public release

Styx's open source release was [a little over 2 weeks ago](/posts/styx-emulator-release/).
Since then there's been a lot of good feedback, comments and questions about the how and what of Styx,
and a few questions about the why. Since the "why" questions are always more complicated, I'll answer the how/what first, and then
try and spend a few minutes to address and reflect on the
current state of emulation/rehosting to hopefully help articulate the niche Styx fills quite nicely.

## The Good

I've heard from multiple people taking advantage of Styx's SH4 emulation support, with one already
implementing the majority of their processor of interest. I've also gotten some messages of thanks for an
old PPC implementation that "just worked." There have also been a lot of positive receptions in various
communities welcoming a new kid on the block, looking forward to hearing more. It also sounds like there is
a growing interest around the MVP of the Hexagon instruction emulation backend, so I hope that can turn
into a stepping-off point of some community collaboration. And, even though its not supported some people
tried using Styx on Windows and MacOS. I have since "fixed" the bugs with builds on MacOS in
[dba0f1d](https://github.com/styx-emulator/styx-emulator/commit/dba0f1dc31a07b0a34e67083970da44b9a3b5a72) and
[a1c1fcf](https://github.com/styx-emulator/styx-emulator/commit/a1c1fcff16b7d1e93c187f8834ee993dadb01b7b).
See [this ticket](https://github.com/styx-emulator/styx-emulator/issues/31) for the remaining cross-platform issues. In general you should be able to build the
codebase, but running the [tracebus](https://github.com/styx-emulator/styx-emulator/tree/main/styx/core/styx-tracebus) will not function.

Lots of good energy and movement here! Hope things continue.

## The easier questions

### How am I supposed to use this?

As mentioned [in the docs](https://docs.styx-emulator.org/installing.html),
the Styx Emulator is currently only being distributed as a library. This means you either need to follow the
docs linked to add Styx as a dependency of your rust crate (similar to how the examples work), or build one of
the binding crates and pip install / link against the emitted `.a` / `.so` / `.dylib` / `.dll`.

### How do I make custom components?

Making an emulator for a processor is no simple task, which gets even more complicated when you
start to use someone else's framework. There were a few comments about being confused when trying to
decide on what or how to implement a peripheral for their specific processor. We could turn around
and say "go read the code," but one of the big things we're trying to do is make the learning
process easy! Especially for these common components, there should be usable templates that you
can trivially kickstart your implementation with.

To address this, part of the upcoming user documentation update is focused on adding `cargo-generate`
templates that you can use for all the major trait's eg. `ProcessorImpl`, `EventControllerImpl`, `Peripheral`, and `Plugin`.
This will hopefully help keep new components from contributors looking like components already in-tree,
making it easier to update and refactor the code when the time comes.

See the [Pull Request](https://github.com/styx-emulator/styx-emulator/pull/113) and
[commit](https://github.com/styx-emulator/styx-emulator/pull/113/commits/694b1f5bf324c2b8309652eba1122b6f35385b29) for more information!

### What does the architecture support look like?

Architecture support really comes in two layers. There is the "glue code" in the `styx-cpu-type` crate, and
then the actual backend execution support implemented at the `styx-cpu-<backend-name>-backend` crates. Note that
while there is a `Backend` enum, you don't have to use it to still use Styx (see the
[external-backend](https://github.com/styx-emulator/styx-emulator/tree/main/examples/external-backend) example for more information).
So you could eg. contribute the architecture glue code in the `styx-cpu-type` crate to teach Styx about your
architecture of interest without contributing your super secret sauce high performance backend. This would allow you
and other users to have a smaller + more integrated patchset with upstream Styx. There's no reason Styx
should be the blocker to using the nice interfaces and libraries - if you find something that doesn't allow
you to "bring your own," file an issue.

### Why is the `Arch` enum have so many entries if you don't support all those yet?

This is where we start to get into the core ideals of Styx. Styx aims to allow users to override or bring
their own behavior, even if upstream/mainline Styx hasn't implemented or thought of things yet. Not only
does this allow for easier tinkering and experimentation by contributors, but it also allows for organizations
to have an easier time maintaining (and hopefully contributing!) custom or fixed behavior. To put it
plainly: if a company wants to use Styx and eg. not contribute a backend for an architecture, so be it.
We shouldn't make it difficult, we should actually encourage it. 

Taking the previous example a little further, if a company wanted to add an architecture support, but not
contribute a backend (eg. add the `Arch`, `ArchRegister`, and `ArchVariant` definitions for RISCV32 to 
"add the glue code", but not add backend support in-tree), that is a welcome contribution. Remember,
Styx "architecture support" comes in [two layers](#What-does-the-architecture-support-look-like), the
glue, and the backend support. This allows down-stream users to maintain less-invasive and stable patchsets.
Less friction for users == good.

The architectures is a particular pain point that should be trivially solved. So the goal is to make it easy.

## The not so easy questions

### Why not Renode

A question we and some users have gotten is "why not Renode?" Which is a fair question.
An easy answer is "read the introduction post", or "how easy is it to add a new
architecture to Renode"? But those answers are a cop-out and not constructive. The better answer
is that Renode and Styx serve two different use cases and goals. Styx aims to be a framework that
allows users to trivially tailor or add their desired behavior if the maintainers didn't think of it
first. The set of core interfaces (which itself should be a research paper or at least its own blog post)
in Styx allows for customization of the entire emulation stack, including bringing your own execution backend.


#### Current Rehosting/Emulation projects

For a bit of context, modern rehosting/emulation tools really only fall into one of a few camps:

- QEMU mainline
- QEMU/TCG fork for a specific target
- QEMU/TCG fork for generic support 
- "rehost" an arm32 firmware on an arm64 machine
- a oneoff target specific emulator
- try and use Ghidra SLEIGH or PCODE
- an expensive commercial solution that might support some of your needs

All of these approaches have their use cases, benefits, and tradeoffs, but there never really was
something that let us properly approach the idea of emulating and debugging systems of connected
devices of diverse architectures. RENODE exists, so does SIMICS, and the ability to color outside
the lines of the few supported targets was regularly a non-starter for us. "It's open source" only
gets you so far if you have to maintain a stale patchset on top of a project moving fast, in a
different direction. Then its the initial stale-qemu-fork problem all over again.

#### The need for something different

I went into some specifics a little more [responding to an issue on the repository](https://github.com/styx-emulator/styx-emulator/issues/103#issuecomment-3329897234),
but the TLDR is; none of the available options really gave us the tools we needed to support the targets we had
(something something, there's more than just linux out there).

Generally boiling down to:

- not user-extensible
- no easily accessible interrupt data tracking
- too focused on supporting $specific operating system
- not faithful to MMIO (eg. writing to the data register without enabling it should not transmit data)
- no Harvard memory support
- no easy way to instrument a specific usermode process under a specific OS kernel
- no easy way to add new architectures.

## Conclusion

In summary, the perceived need / value of Styx comes from less from the "everything is bad" and more from
the "1000 small cuts waste a lot of time, energy, and hours" for a bunch of tools that didn't fulfill the usecase.
We needed an emulator that lets users customize, configure, connect, and debug concurrent systems in a programmatic
matter that comes batteries included for your debugging and vulnerability discovery needs. Styx is attempting
to fill that gap. By providing an easy mechanism to perform standard emulation tasks in a backend-agnostic
manner, the Styx Emulator is attempting to provide a middleground to help people rapidly experiment and
develop new emulation tools to continue to move the emulation scene forwards, instead of encouraging
yet another stale fork of QEMU.
