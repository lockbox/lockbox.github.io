+++
title = "nix gotchas"
author = ["lockbox"]
date = 2024-02-10
draft = false
+++

<div class="ox-hugo-toc toc">

<div class="heading">Table of Contents</div>

- [Updating Nix daemon settings](#updating-nix-daemon-settings)
    - [Related github issue](#related-github-issue)
- [Nix only tracks things added to git](#nix-only-tracks-things-added-to-git)

</div>
<!--endtoc-->


## Updating Nix daemon settings {#updating-nix-daemon-settings}

TLDR;

```shell
 sudo kill-all nix-daemon
```

or

```shell
 nix -k <command you were going to run>
```

Why do you need to restart the daemon when a config file is changed as opposed to just telling it to reload?
Not sure but this works for now.


### Related github issue {#related-github-issue}

[NixOS autoreload config file on change](https://github.com/NixOS/nix/issues/8939)


## Nix only tracks things added to git {#nix-only-tracks-things-added-to-git}

when using flakes you **must** at least stage changes to git, otherwise you will get
very difficult to debug errors

eg. your working directory looks like

```shell
fd
```

and you make a change to `systems/default.nix`.

```shell
git status
```

Then you attempt to use or import `systems`, as an exmaple just try to execute it inline with the repl:

,#+begin_src shell
nix repl --file systems/
\#+end_src

you will actually be execcuting on the **previous** state of `default.nix` that git has in its object store
until you `git add`, or commit etc.
