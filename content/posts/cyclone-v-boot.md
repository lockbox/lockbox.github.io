+++
title = "Simplified Boot Flow for the Cyclone V"
author = ["lockbox"]
date = 2024-02-18
draft = false
tags = ["cyclone", "embedded", "linux"]
+++

<div class="images/posts-toc toc">

<div class="heading">Table of Contents</div>

- [Executing User Software](#executing-user-software)
    - [PreLoader Image Requirements](#preloader-image-requirements)
    - [PreLoader Actions](#preloader-actions)
    - [PreLoader Memory State](#preloader-memory-state)
    - [Bootloader execution (u-boot)](#bootloader-execution--u-boot)
    - [Operating System Boot](#operating-system-boot)

</div>
<!--endtoc-->

The [Cyclone V Technical Reference Manual](<https://www.intel.com/content/www/us/en/docs/programmable/683126/21-2/hard-processor-system-technical-reference.html>)
details the boot flow for the common "running linux to boot your FPGA" usecase like so:

<a id="figure--fig: cyclone-v-boot-flow"></a>

{{< figure src="/images/posts/manual-boot-flow.png" caption="<span class=\"figure-number\">Figure 1: </span>Technical Reference Manual Diagram of Typical Boot Flow" >}}

But because everything after the BootROM is classified as "user software," there is not much described in the manual.

What the manual describes as "user software" still encompasses an entire software stack built,
maintained, and packaged by Altera, but **can** be overriden by the user. As far as behavior and
code that users cannot overwrite go, we are limited to the BootROM.

The BootROM is described in short on page `A-5`, and the state machine is fully diagrammed on
page `A-27`.

-   BootROM is 64kb in size
-   Located in on-chip ROM at address range `0xFFFD_0000` to `0xFFFD_FFFF`
-   The purpose is to determine the boot source, initialize the HPS after reset, and jump to the PreLoader

There is a little more nuance if the PreLoader needs to be loaded from flash into RAM. RTFM for more.


## Executing User Software {#executing-user-software}

The BootROM's entire purpose is to call the PreLoader, and setup the initial environment necessary for
the PreLoader to be able to load the BootLoader (u-boot) which in turn loads the Operating System (Linux).

Page `A-31` details the entry state of the processor on calling the PreLoader:

-   I-cache disabled
-   Branch Predictor enabled
-   D cache disabled
-   MMU disabled
-   FPU enabled
-   NEON enabled
-   Processor is in ARM `supervisor` mode

Register state:

-   `r0`: pointer to shared memory block used to pass information to PreLoader (located in top 4kb of on-chip RAM)
-   `r1`: length of the shared memory
-   `r2`: set to `0x0`
-   `r3`: reserved

Other system state:

-   BootROM is mapped to address `0x0`
-   `L4` watchdog timer active and toggled
-   Reset cause saved to `stat` register of the Reset Manager
-   Shared memory is setup as described in table `A-18`

Before the PreLoader can actually be executed, the BootROM validates the PreLoader image after mapping
it into memory at address `0xFFFF_0000` -&gt; `0xFFFF_F000`.


### PreLoader Image Requirements {#preloader-image-requirements}

-   Validation word matches magic `0x3130_5341` ("10SA")
-   Header version matches
-   Header program length (in 32-bit words) from offset 0 to the end of the code area
    -   Not including exception vectors or CRC
-   Checksum of all bytes in the header from offset `0x40` to `0x49`
-   Maximum size of 60 kb (on-chip RAM - 4kb reserved RAM)

{{< figure src="/images/posts/preloader-image-layout.png" caption="<span class=\"figure-number\">Figure 2: </span>PreLoader Image Layout" >}}


### PreLoader Actions {#preloader-actions}

The manual very helpfully describes the PreLoader functions as "user-defined, however typical functions include ..."
But also describes a detailed state machine + order of operations on page `A-29`.

TLDR;

-   Freeze all I/O banks
-   Reset peripherals
-   Setup clocks
-   Unfreeze all I/O banks
-   L3/L4 configuration
-   Timer + UART initialization
-   SDRAM initialization
-   Boot next stage


### PreLoader Memory State {#preloader-memory-state}

Probably the most helpful thing in the manual so far is this image that shows the state of the memory regions.
In the paragraph before this in the manual, it discusses that until the `L3` interconnect remap bit 0 is
set high, the exception vectors are still pointing to the exceptions handlers provided by the BootROM.
Setting this bit high remaps the on-chip RAM that the PreLoader is executing with into the 0 page to
successfully splat onto the BootROM handlers.

{{< figure src="/images/posts/preloader-remapping-memory.png" caption="<span class=\"figure-number\">Figure 3: </span>Memory state of the Cyclone V HPS before and after executing a (compliant) PreLoader" >}}

Comparing this to the [ARM Cortex-A booting a bare-metal system guide](<https://developer.arm.com/documentation/den0013/d/Boot-Code/Booting-a-bare-metal-system>), we can
start to see some similarities and start to line things up at least as far as code-layout goes.

The PreLoader (after settting up the respective peripherals), then calls the BootLoader.


### Bootloader execution (u-boot) {#bootloader-execution--u-boot}

u-boot is going to do a few main things:

-   Get loaded at `0xFFFF_0000`
-   Load u-boot scripts that are present
-   Find the device tree it is supposed to use
-   Execute the kernel with the device tree passed as a parameter

In the default [provided-from-altera-open-source u-boot configuration](<https://github.com/altera-opensource/u-boot-socfpga/blob/14e5dc0d59381b43979ab059f1de9cf9afe3645a/configs/socfpga_cyclone5_defconfig>),
there are a few things to note in the \`KConfig\` for the target:

-   booting with SPL u-boot (full blown u-boot), with `0xFFFF_0000` start address
-   default malloc len is size `0x4000_0000` (1GB)
-   u-boot expects to be at specific offsets into the SPI flash device memory

Looking at the [default device-tree](<https://github.com/altera-opensource/u-boot-socfpga/blob/14e5dc0d59381b43979ab059f1de9cf9afe3645a/arch/arm/dts/socfpga_cyclone5_socdk.dts>) (also provided by Altera),
we can get the list of all the device drivers we need to bake into our linux kernel image (via the "compatible" attribute in each section),
the size of memory via the `memory` section, and the default peripherals setups of everything else. Note that you can also describe SRAM
by using the `sram` section (`mmio-sram` is the correct driver aiui), and the `sdram` / `mmc` blocks as well.

From there, any `u-boot` scripts or environment will dictate how linux (and your fpga :p) is actually going to get loaded and executed.
Nowadays you'll probably run into a \`bootz\` ([docs](<https://docs.u-boot.org/en/latest/usage/cmd/bootz.html>)).


### Operating System Boot {#operating-system-boot}

If you get the default zlinux, then it will self unpack into memory, and then execute the \`init\` command as specified in your
kernel command line environment.

And it's done and booted! :D
