+++
title = "Updating Nix daemon settings"
author = ["lockbox"]
date = 2024-02-10
draft = false
+++

<div class="ox-hugo-toc toc">

<div class="heading">Table of Contents</div>

- [Related github issue](#related-github-issue)

</div>
<!--endtoc-->

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


## Related github issue {#related-github-issue}

[NixOS autoreload config file on change](https://github.com/NixOS/nix/issues/8939)
