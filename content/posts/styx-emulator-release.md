---
title: "Styx Emulator Public Release"
date: 2025-09-23T16:00:00-04:00
draft: false
categories: []
tags: ["styx", "tool", "release"]
summary: "Announcing the Public Release of the Styx Emulator"
---

This has been a long time in the making. Today we're announcing the public release of the [**Styx Emulator**](https://github.com/styx-emulator/styx-emulator)!

## What is Styx?

Styx is designed to be a foundational tool for building custom emulators with a focus on security research and debug tooling for DSPs, weird SoCs and embedded systems. We hope you find it as useful as we do for emulation tasks, and that it allows you to focus on target specifics rather than the underlying emulation mechanics. 

So far we've found Styx to be usable in our daily emulation workflows and be a large
improvement for the status quo (a la QEMU/PANDA + UNICORN/QILING etc.) specifically
when debugging embedded systems and other targets that fit in the "non linux usermode"
category.

Some features we're proud of:

* Built-in bug finding tools (libAFL, memory error detection plugins)
* Built-in gdbserver with monitor commands
* High performance, tunable cross-emulator tracebus
* Programmatic I/O Access and Manipulation
* Library-first to provide first-class tailoring support
* (fledgling) Ghidra interop

Styx is attempting to fill the gap in current emulation tools where nothing quite
fits all the common needs of debugging embedded systems. In particular, Styx has two
features that set it apart from all other emulation frameworks out there:

* letting users _choose from multiple instruction execution backends_
* letting users declaratively or programmatically _connect multiple processors_ and peripherals together

In short: **Styx** comes bundled with fuzzing support, plugins, external tool integrations and multi-processor capabilities in order to bring modern tools to long forgotten architectures and targets.

## Who should use Styx?

Note that the amount of targets and peripherals currently supported in Styx is not large, but it
is growing. In general our "should you bother using Styx" guidance we give people is:


**When to use Styx**:

* Your target isn't supported by QEMU, it will be significantly easier to add support to Styx
* You need **harvard memory emulation**
* You're developing an embedded system you're going to need to debug
* You're looking for bugs in someone else's embedded system
* You want to apples-to-apples your emulator execution backend against one we have in-tree
* You're debugging a multi-processor system
* You're debugging a driver and need more introspection

But, especially if you're just booting and debugging linux or linux binaries, QEMU is
probably plenty. QEMU is great when you fit the intended usecase, and its fast (it is the
"quick" emulator after all). But sometimes you need to extend it in one way or another,
or need new target support, thats where Styx shines.

## Birds-eye view of the Styx Approach

The Styx Emulator is written in Rust, which gave us the side effect of increased developer
experience over the C/C++ lifestyle many of us are used to. Rust makes it possible
to go-to definition of basically everything, something essentially impossible with the
object oriented C of codebases like QEMU. It also allowed the team to punt on "perfect"
data structure / ownership design with the `Arc<Mutex<T>>` copout until the features/speed
tradeoff deemed it essential to solve. Two cool side effects we weren't expecting!

Using Rust wasn't without its struggles though;
particularly around the `Processor` / `ProcessorCore` / `Mmu` / `EventController` abstractions where
we essentially have a bundle of sibling-level types with no clear ownership tree. We
have had multiple iterations of the data structure and trait design, using and learning
from all the big Rust codebases and blogs out there to try stuff that worked for our
usecase. To complicate things even more, every abstraction we made and named we had to map
back onto physical *things* as they relate to our debug/emulation targets. But eventually
we found things that worked.

Less a Rust and more a "strict typing" / software architecture win was having a set of
defined and *importable* interfaces: this allows users of Styx to rapidly iterate on their target
specifics **without worrying about the underlying emulation / emulator details**, and parallelize
emulator development significantly easier than when working with other emulation tools.
Our current (and pretty stable for awhile now) set of interfaces and components look like
this:

![Styx Emulator Architecture Diagram](/images/posts/styx-architecture-diagram.png)

See [Core Concepts (below)](#Core-Concepts) or [Core Concepts (upstream)](https://docs.styx-emulator.org/concepts.html) For more information on the relation between the components in the diagram.

This design encompasses all the major components of SoCs and microcontroller systems we've
needed to model from the digital level on up. These core interfaces allow some pretty nifty
spot-optimizations or "special case" design, and enable the next-level user configurability /
customization piece from both Rust and any of the binding programming languages.

See [my Post on our USENIX 2025 poster presentation](/posts/presentation-usenix-2025-investigating-composable-emulation/) for more details
on more of the "why" and "how" of Styx. Continue reading for the what!

## Quickstart

**NOTE**: Styx is currently only available as a library. Meaning you
can pip install it, link against the C bindings, or include the rust
crate in your project.

### Simple quickstart

Rust: see the [installation docs](https://docs.styx-emulator.org/installing.html#installing-from-source) for information about adding to a rust project. 

Python (see the [installation docs](https://docs.styx-emulator.org/installing.html#installing-from-source) for dependency information):
```shell
git clone https://github.com/styx-emulator/styx-emulator
cargo install just
just setup

# install python api into local virtual env
. venv/bin/activate
pip install styx/bindings/styx-py-api

# now use the python api
$ python
Python 3.12.8 (main, Dec  6 2024, 00:00:00) [GCC 14.2.1 20240912 (Red Hat 14.2.1-3)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import styx_emulator
>>>
```
### Comparing to the UNICORN example

(Straight from [Styx swapped for UNICORN](https://docs.styx-emulator.org/user/unicorn_replacement.html))

```rust
use std::borrow::Cow;

use styx_emulator::core::cpu::arch::arm::{ArmRegister, ArmVariants};
use styx_emulator::core::processor::executor::Executor;
use styx_emulator::core::cpu::hooks::StyxHook;
use styx_emulator::prelude::*;
use styx_emulator::processors::RawProcessor;

use keystone_engine::Keystone;

/*
    MOV     R0, #5                ; Load 5 into register R0
    MOV     R1, #3                ; Load 3 into register R1
    MUL     R2, R0, R1            ; Multiply R0 by R1, store result in R2
    SVC     #0                    ; Trigger a software interrupt
*/
const THUMB_CODE: &str = "MOV R0, #5; MOV R1, #3; MUL R2, R0, R1; SVC #0";

/// Uses Keystone to assemble some Arm instructions and return the resulting bytes
fn assemble_code() -> Vec<u8> {
    let ks = Keystone::new(keystone_engine::Arch::ARM, keystone_engine::Mode::THUMB)
        .expect("Could not initialize Keystone engine");
    let asm = ks
        .asm(THUMB_CODE.to_string(), 0x4000)
        .expect("Could not assemble");

    println!("Assembled {} instructions", asm.stat_count);
    asm.bytes
}

/// Callback for tracing instructions
fn hook_code(cpu: ProcessorCoreBackend) {
    println!(">>> Tracing instruction at 0x{:x}", cpu.pc().unwrap());
}

/// Callback for tracing basic blocks
fn hook_block(_cpu: ProcessorCoreBackend, address: u64, size: u32) {
    println!(">>> Tracing basic block at 0x{:x}, block size = {}", address, size);
}

/// Callback for tracing interrupts
fn hook_interrupts(cpu: ProcessorCoreBackend, intno: i32) {
    println!(">>> Tracing interrupt at 0x{:x}, interrupt number = {}", cpu.pc().unwrap(), intno);
    // quit emulation
    cpu.stop().unwrap();
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // create a RawProcessor (i.e. minimal processor) for 32 bit Arm LE, using the PCode backend
    let proc = ProcessorBuilder::default()
        .with_backend(Backend::Pcode)
        .with_endian(ArchEndian::LittleEndian)
        .with_variant(ArmVariants::ArmCortexM4)
        .with_loader(RawLoader)
        .with_executor(Executor::default())
        .with_input_bytes(Cow::Owned(assemble_code()))
        .build::<RawProcessor>()?;

    // add hooks for instructions, basic blocks, and interrupts
    proc.add_hook(StyxHook::Code { start: u64::MIN, end: u64::MAX, callback: Box::new(hook_code) })?;
    proc.add_hook(StyxHook::Block { callback: Box::new(hook_block) })?;
    proc.add_hook(StyxHook::Interrupt { callback: Box::new(hook_interrupts) })?;

    // start emulation
    proc.start()?;

    // check that R2 holds the value 15 to see if emulation was successful
    assert_eq!(proc.read_register::<u32>(ArmRegister::R2).unwrap(), 15_u32);

    Ok(())
}
```

### Premade processor quickstart

To use a prepackaged processor its as easy as:

```rust
use styx_emulator::core::processor::executor::Executor;
use styx_emulator::prelude::*;
use styx_emulator::processors::arm::kinetis21::*;
use tracing::info;

/// path to yaml description, see [`ParameterizedLoader`] for more
const LOAD_YAML: &str = "load.yaml";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let proc = ProcessorBuilder::default()
        .with_backend(Backend::Pcode)
        .with_loader(ParameterizedLoader::default())
        .with_executor(Executor::default())
        .with_plugin(ProcessorTracingPlugin)
        .with_target_program(LOAD_YAML)
        .build::<Kinetis21Builder>()?;

    info!("Starting emulator");

    proc.start()?;

    Ok(())
}
```

### Bindings!

Or using the python bindings:

```python
from styx_emulator.cpu.hooks import CodeHook
from styx_emulator.processor import ProcessorBuilder, Target
from styx_emulator.loader import RawLoader
from styx_emulator.executor import DefaultExecutor
from styx_emulator.plugin import ProcessorTracingPlugin

def log_signal(_):
    print("ERROR: signal")

builder = ProcessorBuilder()
builder.target_program = "target.bin"
builder.ipc_port = 16001
builder.loader = RawLoader()
builder.executor = DefaultExecutor()
builder.add_plugin(ProcessorTracingPlugin())
proc = builder.build(Target.Stm32f107)

proc.add_hook(CodeHook(0x690C, 0x690D, log_signal))

proc.start()
```

And real C bindings:

```c
#include "stdio.h"
#include "styx_emulator.h"
#include <stdint.h>
#include <string.h>

#define TARGET_PGM                                                   \
  "target.bin"

void log_signal(StyxProcessorCore cpu)
{
  (void)cpu;
  // look at this: it prints
  uint64_t pc;
  StyxProcessorCore_pc(cpu, &pc);
  printf("Hit loop @ pc 0x%lX\n", pc);
}

void handle_error(StyxFFIError error)
{
  StyxFFIErrorMsg_t msg = StyxFFIErrorMsg(error);
  printf("uh oh: %s\n", msg);
  StyxFFIErrorMsg_free(msg);
}

int main(void)
{
  StyxFFIErrorPtr error = NULL;
  StyxProcessorBuilder builder = NULL;
  StyxExecutor executor = NULL;
  StyxPlugin procTracePlugin = NULL;
  StyxLoader loader = NULL;
  StyxProcessor proc = NULL;
  StyxEmulationReport report = NULL;

  // enable styx logging
  // Styx_init_logging(5, "trace");

  // create the builder
  if ((error = StyxProcessorBuilder_new(&builder)))
  {
    goto defer;
  }
  // set the executor
  if ((error = StyxExecutor_Executor_default(&executor)))
  {
    goto defer;
  }
  error = StyxProcessorBuilder_set_executor(builder, executor);
  executor = NULL;
  if (error)
  {
    goto defer;
  }
  if ((error = StyxProcessorBuilder_set_backend(builder, STYX_BACKEND_UNICORN)))
  {
    goto defer;
  }

  // set the loader
  if ((error = StyxLoader_RawLoader_new(&loader)))
  {
    goto defer;
  }
  error = StyxProcessorBuilder_set_loader(builder, loader);
  loader = NULL;
  if (error)
  {
    goto defer;
  }

  if ((error = StyxPlugin_ProcessorTracingPlugin_default(&procTracePlugin)))
  {
    goto defer;
  }
  error = StyxProcessorBuilder_add_plugin(builder, procTracePlugin);
  procTracePlugin = NULL;
  if (error)
  {
    goto defer;
  }

  // set the target program
  if ((error = StyxProcessorBuilder_set_target_program(
           builder, TARGET_PGM, (uint32_t)strlen(TARGET_PGM))))
  {
    goto defer;
  }

  // have the cpu use 16001 as the Ipc port
  if ((error = StyxProcessorBuilder_set_ipc_port(builder, 16001)))
  {
    goto defer;
  }

  // add a code hook just to test that hooks indeed work
  StyxHook_Code log_signal_hook = {
      .start = 0x590e,
      .end = 0x590e,
      .callback = log_signal,
  };
  if ((error = StyxProcessorBuilder_add_code_hook(builder, log_signal_hook)))
  {
    goto defer;
  }

  // build the processor
  printf("[*] building processor\n");
  if ((error =
           StyxProcessorBuilder_build(builder, STYX_TARGET_STM32F107, &proc)))
  {
    goto defer;
  }

  /// dispose the builder
  StyxProcessorBuilder_free(&builder);
  builder = NULL;

  // this runs the cpu (blocking)
  printf("[*] running processor\n");
  if ((error = StyxProcessor_start_blocking_constraints(proc, 1000, 1000, &report)))
  {
    goto defer;
  }
  printf("[*] processor stopped\n");

  int instructions = StyxEmulationReport_instructions(report);
  printf("[*] total instructions executed: %i\n", instructions);

defer:
  if (error)
  {
    handle_error(*error);
    StyxFFIErrorPtr_free(&error);
  }

  if (builder)
    StyxProcessorBuilder_free(&builder);
  if (executor)
    StyxExecutor_free(&executor);
  if (procTracePlugin)
    StyxPlugin_free(&procTracePlugin);
  if (loader)
    StyxLoader_free(&loader);
  if (proc)
    StyxProcessor_free(&proc);
  return 0;
}
```

### GDB Server Example

Want to run a gdbserver? Just switch out the `Executor` you're using!


```rust
use styx_emulator::core::processor::executor::Executor;
use styx_emulator::prelude::*;
use styx_emulator::processors::arm::kinetis21::*;
use styx_emulator::cpu::arch::arm::gdb_targets::ArmMProfileDescription;
use styx_emulator::plugins::gdb::{GdbExecutor, GdbPluginParams};
use tracing::info;

/// path to yaml description, see [`ParameterizedLoader`] for more
const LOAD_YAML: &str = "load.yaml";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // build the arguments to the gdb server plugin
    let gdb_params = GdbPluginParams::tcp("0.0.0.0", 9999, true);

    // build the processor
    let proc = ProcessorBuilder::default()
        .with_backend(Backend::Pcode)
        .with_loader(ParameterizedLoader::default())
        .with_executor(GdbExecutor::<ArmMProfileDescription>::new(gdb_params)?)
        .with_plugin(ProcessorTracingPlugin)
        .with_target_program(LOAD_YAML)
        .build::<Kinetis21Builder>()?;

    info!("Starting emulator");

    proc.start()?;

    Ok(())
}
```

**NOTE**: The libAFL fuzzing executor works in a similar way.

### More Examples

See `./examples` in the repo for more examples!

## Core Concepts

One of the things we had to establish early on is what form of overloaded terminology we would
use. [Here's](https://docs.styx-emulator.org/concepts.html) what we settled on.

TLDR;

* **Machine**: A physical **thing** made up of an arbitrary number of `Processor`s and `Device`s. When someone asks "Can you emulate my router?" the router would be the machine. Note that you do not often need the abstraction level of a "machine".
* **Processor**: Something equivalent to a SoC (System on Chip). Where there's a "main" `ProcessorCore`/set of `ProcessorCore`s that executes the application code, but it may have a bunch of `Device`s, and sometimes comes with a CoProcessor etc which is just another `ProcessorCore`/`Device`. A `Processor` also brings along with it `Memory`, `Peripheral`s, an `EventController`, and an `Mmu`.
* **ProcessorCore**: A single "core" that executes code from an ISA (Instruction Set Architecture), it gets passed a view into memory, and can decode+execute instructions. 
* **Peripheral**: Something that performs I/O for the `TargetProgram`. Belongs to a single `EventController`+`Processor` pair at a time. eg. UART or Ethernet etc.
* **Device**: Something that communicates to a `Processor` via a `Peripheral` or user custom hooks. eg. an I2C RTC (Real Time Clock) or thermometer module, can be another `Processor`.
* **EventController**: The interrupt controller for a `Processor`, routes interrupts to I/O and redirects control flow of `ProcessorCore`s as necessary.
* **Mmu**: Performs address translation an brokers access to the actual memory contents. As Styx is a generic framework the `Mmu` does not necessarily need to function as a full blown MMU if the target `Processor` does not require it.
* **TargetProgram**: The specific **code** being debugged and emulated.

A lot of these are pretty sensical, however the `Cpu` / `ProcessorCore` / `Processor` distinction was a pretty arbitrary but necessary distinction in order to mentally grok the rust ownership model overlaid onto an incredibly complex relationship of types and data-structures. We also found that calling the *thing* running on the processor `TargetProgram` helped disambiguate what we were talking about, as then "firmware", "library" etc are free to represent what makes sense in the context (eg if the `TargetProgram` is a bare metal firmware, or a binary running in an emulated linux environment). 

## Questions we have for new users

We've been working on this for a long time, but we still believe that we have a long
way to go before this is a solid emulation tool. In particular we're curious and would
like to know your opinions on:

* How is it making a custom processor?
* Does debugging *just work*?
* How quickly can *completely new* people add processor and/or architecture definitions?
* How easy is it for contributors to add new execution backends? (Think something like `bochscpu`, `icicle-emu` etc.)
* How do people feel about the built-in peripheral interfaces? (We haven't settled on how to make those nice yet, they should all be a little clunky)
* What would be useful additions to the bindings?
* What would people want from a "binary installation" of **Styx**? Currently we have only focused attention on building a solid library
  as a foundation to quickly deliver emulated targets
* What would make **Styx** better?
* What other architectures should we add in-tree? (If it's supported by [Ghidra](https://github.com/NationalSecurityAgency/ghidra) it's a pretty low lift depending on how many custom `pcodeop`'s are defined for the architecture)

## Whats on the Roadmap?

We are focused on a bunch of different things, but here are some of the things that we're
going to be doing in the near future (feedback/input/contributions welcome, we will be updating the public roadmap in the near future)

* Smooth multi-emulator orchestration from configuration files (Almost complete)
* Android phone full-system emulators (the **whole** kit and kaboodle, AP+Cellular+WiFI/BT included)
* Styx installation artifacts ('25 Q4?)
* Better tracebus utilities
* More target support
* PCI-E emulation!
* Linux device tree based emulation (given a firmware and a device tree, create an emulator)
* Generic STM32 support?
* Generic AVR support?



## Credits

Thank you to the Kudu Dynamics LLC development team, who have spent a lot of energy developing
this from a side project all the way to a full-fledged usable tool. They continue to be the main development force behind the Styx Emulator.

And thank you to some of the individuals who have had a major hand in shaping the project so far (feel free to dm me to add to the list):

- Lennon Anderson ([@YurBoiRene](https://github.com/YurBoiRene))
- Jeff Eden ([@jeffeden](https://github.com/jeffeden))
- Robert Meikle
- Dillon Shaffer ([@Molkars](https://github.com/Molkars))
- Ramesh Balaji ([@yuv418](https://github.com/yuv418))

I'm excited to see where Styx goes from here!

## Get Started
1. **Follow the Docs** for installation and quick-start tutorials → [docs.styx-emulator.org](https://docs.styx-emulator.org)
2. **Join the Conversation** on the community Discord for Q\&A and to meet everyone → [discord.gg/styx-emulator](Discord)

## Stay Connected

Keep up with all updates, ask questions, and share your feedback:

* **GitHub** → [styx-emulator][github]
* **Twitter** → [@styx_emulator](https://x.com/styx_emulator)
* **Mastodon** → [@styx_emulator](https://infosec.exchange/@styx_emulator)

Jump in today, help us shape the framework into something great and together we can make Styx the go-to emulator for debuggers of all shapes and sizes!

[Discord]: https://discord.gg/styx-emulator
[github]: https://github.com/styx-emulator
