---
title: "Presentation: RSTCON 2025 Styx Release Roadmap"
date: 2025-10-31T09:00:00-00:00
draft: false
categories: []
tags: ["styx", "presentation", "rstcon", "emulation"]
summary: "Presentation Summary of 2025 RSTCON talk about the Styx Emulator"
---

I got the pleasure to present some of the current status and roadmap of the Styx Emulator
at RSTCON 2025. RSTCON is a year 2 conference focused on industrial security and both the
offensive and defensive research that goes into working with those type of targets. Styx
was right at home and got a considerable amount of engagement discussing DSP processors,
the challenges, and ideas to help make tooling for those type of targets just a little
bit nicer. It sounds like there is going to be some collaboration between people on some
Styx work soon!

**Recording**: Not released yet!

**Slides**:

{{< pdf "/pdfs/Styx_RSTCON_2025.pdf" >}}

## Key Points

- The [Styx Emulator](https://github.com/styx-emulator) focuses on enabling the 0 -> 1 emulation capability as fast as possible.
- If your target already works well enough for you in QEMU, **USE QEMU**
- If it doesn't, alllll those leftover targets are where Styx comes in
- Styx is the only emulation framework that abstracts over the execution backend, allowing for private customizations (quite a few people at the conference asked about private backends) as needed with little to no pain or even forks necessary
- Styx is easy to build on top of
- Styx is easy to tailor to your specific usecase (only compile in the instrumentation you need etc)


## Questions from the Conference

### Explain how the target support and backend abstraction works

Target support is well documented in the [documentation site](https://docs.styx-emulator.org),
including actual checklists to bring you all the way to a newly completed target.

ISA (Instruction Set Architecture) support is another slightly more nuanced topic. Unlike
other emulation frameworks, the Styx Emulator abstracts over the instruction execution
backend. This means Styx splits up ISA supports into a _frontend_ and _backend_ piece.

**Frontend ISA Support**:

Additions to the `styx-cpu-type` and `styx-cpu` crate. Specifically the necessary additions
to the `arch` module to add new members to the `Arch`, `ArchVariant`, `ArchMetaVariant`,
`ArchRegister`, and `ArchMetaRegisters` enums. Once you have support here Styx "knows" about
the target architecture and can interact with all API's for any backend/target etc you want
to add support for.

This is the "trivial public upstream" piece, and if you want to make a private execution backend
for an architecture that doesn't exist its ~2-4 hours of work to make this initial trivial
contribution.

_Once you contribute these enum additions you will not need to maintain a fork of the Styx Emulator_.

**Backend ISA Support**:

This is generally what people think of "How does my code get executed?" You can inject an
execution backend into Styx at runtime, or use the in-tree backends. This is what the
`styx-cpu-unicorn-backend` and `styx-cpu-pcode-backend` are. They handle the instruction
decoding + execution. Right now these backends do all the work and are pretty complex.

In the [community discord](https://discord.gg/styx-emulator) we are starting to look at what
we would want from a "new backend" model that splits up the role of the `CpuEngine` trait
for a composable execution backend (a `Lifter`, `Optimizer`, and `Execution` trait so we can eg.
use `SLEIGH` lifter with the `TCG` or `Cranelift` JIT engines and custom optimizations).
Keep an eye out for a [new RFC](https://github.com/styx-emulator/rfcs) for this new backend approach!

### Is this being maintained or was this another released and dropped thing

The Styx Emulator was originally paid for and developed by Kudu Dynamics LLC, a Leidos Company,
and as far as I'm aware still should have plenty of runway for the development team to continue
work on it. At the same time, this is the first public development that company has done, so it
is not without it's challenges, and they are regularly figuring out what they are comfortable
with doing publicly.

It's been mildly slow (but regular) development progress on the public Styx Emulator repository,
and in my opinion I do not think it's going to stop anytime soon. I think as things continue
and they get more comfortable with collaborating with other people the pace will continue to
improve as it has been over the past 2 months since the initial release drop.

TLDR; The development on [github.com/styx-emulator/styx-emulator](https://github.com/styx-emulator/styx-emulator) has been slowly picking up since the release, and I expect it to continue to increase as time goes on.

### More interesting tidbits

The current startup I'm working for is looking at some large potential Styx-related features
including new architecture support, new Ghidra processor modules, and new peripheral development
for things like PCI-E and many common linux hardware drivers that need support in Styx.

If this sounds interesting reach out!

