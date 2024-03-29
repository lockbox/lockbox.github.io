+++
title = "Rust Resources"
author = ["lockbox"]
draft = false
+++

<div class="ox-hugo-toc toc">

<div class="heading">Table of Contents</div>

- [Tools for CI](#tools-for-ci)
- [Cute Rust Patterns](#cute-rust-patterns)
- [Blog Posts](#blog-posts)
- [Libraries to look at again](#libraries-to-look-at-again)
- [Practices to help you be more confident in your complex code](#practices-to-help-you-be-more-confident-in-your-complex-code)
- [Some good to high quality rust resources](#some-good-to-high-quality-rust-resources)
- [Research papers using Rust](#research-papers-using-rust)

</div>
<!--endtoc-->


## Tools for CI {#tools-for-ci}

-   [cargo-update](<https://crates.io/crates/cargo-update>)
-   [cargo-deny](<https://github.com/EmbarkStudios/cargo-deny>)
-   [cargo-license](<https://github.com/livioribeiro/cargo-readme>)
-   [cargo-nextest](<https://github.com/nextest-rs/nextest>)
-   [cargo-llvm-cov](<https://github.com/taiki-e/cargo-llvm-cov>)
-   [git cliff](<https://github.com/orhun/git-cliff>)
-   [kani checker](<https://github.com/model-checking/kani>)
-   [miri](<https://github.com/rust-lang/miri>)
-   [bolero](<https://github.com/camshaft/bolero>)
-   [cargo-valgrind](<https://github.com/jfrimmel/cargo-valgrind>)
-   [cargo-tarpaulin](<https://github.com/xd009642/tarpaulin>)
-   [loom](<https://github.com/tokio-rs/loom>)
-   [cargo-shuttle](<https://crates.io/crates/cargo-shuttle>)


## Cute Rust Patterns {#cute-rust-patterns}

-   [Russian Dolls and clean Rust code](<https://web.archive.org/web/20220126183049/https://blog.mgattozzi.dev/russian-dolls/>)
-   [Elegant Library API's in Rust](<https://deterministic.space/elegant-apis-in-rust.html>)
-   [Using traits as labels](<https://deterministic.space/bevy-labels.html>)
-   [Hexagonal Architecture in Rust](<https://alexis-lozano.com/hexagonal-architecture-in-rust-1/>)
-   [Single Abstract Method Traits](<https://mcyoung.xyz/2023/05/11/sam-closures/#:~:text=What's%20a%20SAM%20trait%20in,%2C%20%26Self%20%2C%20or%20%26mut%20Self%20>)
-   [Can Rust prevent Deadlocks](<https://medium.com/@adetaylor/can-the-rust-type-system-prevent-deadlocks-9ae6e4123037#:~:text=Nevertheless%2C%20it's%20interesting%20to%20me,as%20a%20Substructural%20Type%20System>)
-   [Understanding tracing's macros by buliding them from scratch](<https://dietcode.io/p/tracing-macros/>)
-   [Nine rules for writing python extensions in rust](<https://towardsdatascience.com/nine-rules-for-writing-python-extensions-in-rust-d35ea3a4ec29>)
-   [Nine rules for creating fast, safe, compatible data structures in rust (series)](<https://towardsdatascience.com/nine-rules-for-creating-fast-safe-and-compatible-data-structures-in-rust-part-1-c0973092e0a3>)
    -   a lot of the articles from this guy are meh, but starting out this one actually helped me


#### Protocol patterns {#protocol-patterns}

-   [Communication over raw I/O streams async](<https://xaeroxe.github.io/async-io/>)


#### State Machine Patterns {#state-machine-patterns}

-   [Pretty State Machine Patterns in Rust](<https://hoverbear.org/blog/rust-state-machine-pattern/>)
-   [Phase Locked State Machines](<https://onevariable.com/blog/phase-locked-state-machines/>)


#### Zero-Cost Abstractions {#zero-cost-abstractions}

-   [Programming a microntroller at four levels of abstractions](<https://pramode.in/2018/02/20/programming-a-microcontroller-in-rust-at-four-levels-of-abstraction/>)
-   [Rust embedded book ZCA](<https://doc.rust-lang.org/beta/embedded-book/static-guarantees/zero-cost-abstractions.html>)
-   [Rust embedded book Static Guarantees](<https://doc.rust-lang.org/beta/embedded-book/static-guarantees/index.html>)
-   [Bringing Runtime checks to Compile time](<https://ktkaufman03.github.io/blog/2023/04/20/rust-compile-time-checks/>)


## Blog Posts {#blog-posts}

-   [Cheap tricks for high-performance Rust](<https://deterministic.space/high-performance-rust.html>)
-   [Ampersand driven development](<https://fiberplane.com/blog/getting-past-ampersand-driven-development-in-rust>)
-   [Intro to Declarative Macros](<https://medium.com/@altaaar/a-guide-to-declarative-macros-in-rust-6f006fdaeebf>)
-   [Ergonomic Extractors](<https://www.youtube.com/watch?v=7DOYtnCXucw>)
-   [Exercises to accompany the Book](<https://www.hyperexponential.com/blog/rust-language-exercises-at-hx>)
-   [Baby's first rust quadtree](<https://dev.to/kurt2001/a-nibble-of-quadtrees-in-rust-4o7g>)
-   [Rust to Webassembly the hard way](<https://surma.dev/things/rust-to-webassembly/>)
-   [Plugins for Rust: WASM](<https://reorchestrate.com/posts/plugins-for-rust/>)
-   [Public github python package in rust](<https://antoniosbarotsis.github.io/posts/python_package_written_in_rust/>)
-   [Zig vs. Rust](<https://zackoverflow.dev/writing/unsafe-rust-vs-zig/>)
-   [Walkthrough of the ripgrep project](<https://blog.mbrt.dev/posts/ripgrep/>)
-   [rseq in Rust](<https://mcyoung.xyz/2023/03/29/rseq-checkout/>)
-   [build a non-binary tree that is thread safe using rust](<https://developerlife.com/2022/02/24/rust-non-binary-tree/>)
-   [Guide to nom parsing](<https://developerlife.com/2023/02/20/guide-to-nom-parsing/>)
-   [Flexible tracing with rust and OpenTelemetry OTLP](<https://broch.tech/posts/rust-tracing-opentelemetry/>)
-   [Using kani to verify code](<https://medium.com/@carlmkadie/check-ai-generated-code-perfectly-and-automatically-d5b61acff741>)
-   [The problem with safe FFI bindings in Rust](<https://www.abubalay.com/blog/2020/08/22/safe-bindings-in-rust>)
-   [Unsafe Rust: How and when (not) to use it](<https://blog.logrocket.com/unsafe-rust-how-and-when-not-to-use-it/>)
-   [French NSA secure Rust guidelines](<https://anssi-fr.github.io/rust-guide/01_introduction.html>)
-   [6 useful rust macros](<https://medium.com/@benmcdonald_11671/6-useful-rust-macros-that-you-might-not-have-seen-before-59d1386f7bc5>)


## Libraries to look at again {#libraries-to-look-at-again}

-   [parsel](<https://crates.io/crates/parsel>)
-   [nom](<https://crates.io/crates/nom>)
-   [rerun](<https://github.com/rerun-io/rerun>)
-   [mirai](<https://github.com/facebookexperimental/MIRAI>)
-   [plotters](<https://github.com/plotters-rs/plotters>)
-   [perspective](<https://github.com/finos/perspective>)
-   [rhai](<https://github.com/rhaiscript/rhai>)
-   [nyx-space](<https://github.com/nyx-space/nyx>)
-   [autometrics](<https://github.com/autometrics-dev/autometrics-rs>)
-   [bilge](<https://github.com/hecatia-elegua/bilge>)
-   [metrics](<https://github.com/metrics-rs/metrics>)
-   [static_assertions](<https://github.com/nvzqz/static-assertions>)
    -   will be more useful as `const` rust gets more powerful
-   [petgraph](<https://github.com/petgraph/petgraph>)
-   [indradb](<https://github.com/indradb/indradb>)


## Practices to help you be more confident in your complex code {#practices-to-help-you-be-more-confident-in-your-complex-code}

-   miri + kani for unsafe things
-   use \`cargo nextest\` instead of \`cargo test\`
-   use console for helping debug async
-   [A flake for your crate](<https://hoverbear.org/blog/a-flake-for-your-crate/>)
-   [Code Coverage Examples in Rust](<https://rrmprogramming.com/article/code-coverage-in-rust/>)
-   [Github Actions to deploy cross-platform rust binaries](<https://dzfrias.dev/blog/deploy-rust-cross-platform-github-actions>)


## Some good to high quality rust resources {#some-good-to-high-quality-rust-resources}

-   [Rust Atomics and Locks](<https://marabos.nl/atomics/>)
-   [High Assurance Rust](<https://highassurance.rs/chp3/_index.html>)
-   [Rust for Rustaceans](<https://nostarch.com/rust-rustaceans>)
-   [proc-macro-workshop](<https://github.com/dtolnay/proc-macro-workshop>)
-   [Rust Design Patterns](<https://rust-unofficial.github.io/patterns/>)


## Research papers using Rust {#research-papers-using-rust}

-   [Agile Development of Linux Schedulers with Ekiben](<https://arxiv.org/abs/2306.15076>)
-   [Friend or Foe Inside? Exploring In-Process Isolation to Maintain Memory Safety for Unsafe Rust](<https://arxiv.org/abs/2306.08127>)
