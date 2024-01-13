+++
title = "Yubikey-GPG on linux"
author = ["lockbox"]
date = 2023-12-28
draft = false
+++

<div class="ox-hugo-toc toc">

<div class="heading">Table of Contents</div>

- [Yubikey-SSH](#yubikey-ssh)
- [Important Links](#important-links)

</div>
<!--endtoc-->

TLDR; `man 1 gpg`

What started as two independent efforts trying to get yubikey-ssh and gpg-signed-git commits
turned into 1 combined effort.


## Yubikey-SSH {#yubikey-ssh}

Requirements:

-   `openssh` build with support for security keys
    On Gentoo:
    ```shell
        USE=security-key emerge -aq net-misc/openssh
    ```

Then you unlock the ability to create new ssh-keys with the `*-sk` suffix.
You also probably want to add the options to make the key resident on the key
and to require authorization every time a la:

```shell
 ssh-keygen -t ecdsa-sk -O resident -O application=ssh:text -O verify-required
```

Note that the "text" portion can be anything


## Important Links {#important-links}

Start with the gentoo setup instructions, as they're consistently decent.

-   [Yubikey on Gentoo](<https://wiki.gentoo.org/wiki/YubiKey>)
-   [Yubikey/GPG](<https://wiki.gentoo.org/wiki/YubiKey/GPG>)
-   [Yubikey/GPG + SSH](<https://wiki.gentoo.org/wiki/YubiKey/SSH>)
-   [Gentoo Dev GPG guide](<https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys#How_to_generate_the_GLEP_63-compliant_OpenPGP_key>)
-   [Gentoo GnuPG](<https://wiki.gentoo.org/wiki/GnuPG>)

Then follow them up with the actual [YubiKey Docs](<https://developers.yubico.com/SSH/Securing_SSH_with_FIDO2.html>)

Adding gpg to git commits:

-   <https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work>
