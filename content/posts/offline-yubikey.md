---
title: "Offline Yubikey"
date: 2025-03-31T16:45:00-00:00
draft: false
categories: [""]
tags: ["offline", "pki", "yubikey", "pgp"]
summary: "Setup and configuring offline PKI and PGP with Yubikey's"
---

This is immortalizing the process so that I never need to figure out how to do this again,
since its annoyingly complicated. But hey, then offline networks just kind of _work_, which is nice.

## High-Level Process

- Get dependencies on an SBC
- Get 2 Yubikey's to be the root storage for gpg+pki
- Get n more Yubikey's to be the intermediate authority for PKI
- Get n more Yubikey's to be the intermediate authority for PGP
- Disconnect the SBC (and keep it that way)
- Reset the Yubikey's
- Create the root cert's + keys
- Create the intermediate certs + keys
- Generate and store revocation certificates for the intermediate certs + keys
- ???
- Profit.

## Current Setup

- Two Root Yubikey's
- One intermediate Yubikey for PKI used in infra
- N Yubikey's for intermediate PGP on all my dev machines

## Doing the thing

This loosely follows [Offline PKI Yubikeys](https://blog.josefsson.org/2014/06/23/offline-gnupg-master-key-and-subkeys-on-yubikey-neo-smartcard/) and
[offline gnupg master key and subkeys on yubikey neo](https://blog.josefsson.org/2014/06/23/offline-gnupg-master-key-and-subkeys-on-yubikey-neo-smartcard/).
So TLDR; the dependencies are 1 offline machine (an RPi you don't have a use for?) and 2 spare yubikeys version 5.4+ (one of mine was too old,
you should probably check).

### Get all the pieces

Make sure you collect the pieces mentioned above as those are hard dependencies. Unspoken is the "at least one more to use day to day."

### Setup software dependencies

- gnupg
- gpg-agent
- scdaemon
- libpcsclite-dev
- yubikey-manager (or yubico authenticator after February 19, 2026)
- python3-venv and python3 >= 3.11
- git

Then clone and install `https://github.com/vincentbernat/offline-pki`

```shell
git clone https://github.com/vincentbernat/offline-pki
cd offline-pki
python3 -m venv v
source v/bin/activate
pip install .
offline-pki --help
```

If the last line works with no errors you're good to go. Python packaging is a mess so make sure it works, everything here on out is no internet.

### Disconnect from the network

The system you're doing this on should be unplugged/disconnected from the network, and ideally never access it again. Be warned.
To get things into+out of your network is sneakernet or a data diode setup you trust. YMMV.

### Reset Yubikey's

#### Generate Management Keys

Make a simple shell script on your disconnected machine, I called mine `new-mgmt-key.sh`, we'll use this to generate a single
Management Key for the Root CA Yubikey's, and an individual Management Key for each Intermediate CA Yubikey.

`./new-mgmt-key.sh`:
```shell
#!/usr/bin/env bash

out="${1}"

head -c 32 /dev/urandom | xxd -p -c 32 | tr -d '\n' | tee "${out}"
```

This will read 32 bytes from `/dev/urandom`, and then write the hex chars out to the argv1 of the script.

So you should at a minimum be running the following commands:

```shell
chmod +x new-mgmt-key.sh
./new-mgmt-key.sh root-mgmt-key # only 1 root key since all root mgmt-keys must match
./new-mgmt-key.sh intermediate1-mgmt-key
```

And now you have the keys required for the next step!

#### Reset Each Yubikey

while in the directory plug in a single of the yubikey's at a time and run:

```shell
offline-pki reset yubikey --yes --management-key `cat <path to mgmt-key>`
```

For the 2 Root CA Yubikey's and the N Intermediate CA Yubikey's, and the script will walk you through setting the
PIN and the PUK for each of the Yubikey's.

**NOTE**: The Management Key on each ROOT CA Yubikey must be the same

### CA Creation

This step will setup the 2 Root CA Yubikey's and your Intermediate CA Yubikey's.

#### Root CA Creation

Start this step with any Root CA Yubikey plugged in

```shell
offline-pki certificate root \
    --subject-name "CN=Root CA,O=Really Cool Organization,C=US" \
    --permitted dns:example.com \
    --excluded dns:www.example.com \
    --permitted ip:192.168.0.0/24 \
    --permitted email:@example.com \
    --management-key `cat <path to root mgmt-key>`
```

When it asks for another Yubikey, remove the currently plugged in Root CA Yubikey and plug in the other one. Then respond "y".

#### Intermediate CA Creation

Keeping your last Root CA Yubikey plugged in, run the following command:

```shell
offline-pki certificate intermediate \
    --management-key `cat <path to intermediate mgmt-key>`
```

You will be prompted for the PIN for that Root CA Yubikey, provide it.

When prompted to "plug Intermediate", do so and press Enter.

Same for back to the Root CA Yubikey.

And one last time back to the Intermediate CA Yubikey.

#### CSR Signature

To imitate a certificate request and verify that things are working we can follow the example from `offline-pki`.

Generate a new private key, and output a certificate request (edit subject line as necessary):

```shell
openssl req \
   -config /dev/null \
   -newkey ec:<(openssl ecparam -name secp384r1) -sha384 -nodes \
   -subj "/C=FR/O=Example SARL/OU=Network/CN=ipsec-gw1.example.com" \
   -addext "subjectAltName = DNS:ipsec-gw.example.com" \
   -addext "keyUsage = digitalSignature" \
   -keyform PEM -keyout server-key.pem -outform PEM -out server-csr.pem
openssl req -noout -text -in server-csr.pem
```

Then, leaving the Intermediate CA Yubikey inserted:

```shell
offline-pki certificate sign --csr-file server-csr.pem --out-file server.crt
```

And then enter the Intermediate CA PIN when prompted.

Congrats! Its done :)

### PGP Configuration

I use a config based on [GLEP 63: Gentoo OpenPGP policies](https://www.gentoo.org/glep/glep-0063.html) + [GnuPG Configuration: Gentoo Wiki](https://wiki.gentoo.org/wiki/GnuPG#Configuration), you probably want something similar.

#### Generating the Keys

This is the easy part. We're basically just following the [Gentoo Developer pgp setup guide](https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys#Step_3:_Update_gpg.conf).


```shell
gpg --full-generate-key --expert
```

And follow the prompts + steps in the guide.

My current setup follows [GnuPG Configuration: Gentoo Wiki](https://wiki.gentoo.org/wiki/GnuPG#Configuration), selecting `8) RSA (set your own capabilities)`.
Then removing all except `Certify` from the root key. This key will remain airgapped and not shared.

I then made new keys (a la `gpg --expert --edit key <key-id>` -> `gpg> addkey`)

| Purpose        | Key Type   |
|----------------|------------|
| Signature      | RSA-4096   |
| Encryption     | RSA-4096   |
| Authentication | Curve25519 |


If needed after the keys are setup you can add more emails:

```shell
gpg --edit-key <keyid we just made>
gpg> adduid
```

And follow the prompts.

Finally, enter `save` to complete the process.

```shell
gpg> save
$
```

At this point you should `gpg --list-keys` to ensure everything looks correct.

#### Generate Revocation Certificate

Follow the "Create a revocation certificate" guide from the [offline gnupg master key and subkeys](https://blog.josefsson.org/2014/06/23/offline-gnupg-master-key-and-subkeys-on-yubikey-neo-smartcard/) guide.

#### Backup the valid Master Key GnuPG Configuration

GnuPG is nothing if not imperfect (and this operation is something you _really_ don't want to fail), so you need to backup
both a copy of your secret key, and a backup of the gnupg home directory (by default it is at `~/.gnupg`, or `$GNUPGHOME`)


Export a copy of the secret key

```shell
gpg -a --export-secret-keys <key id> > master-key.pem
```

Then follow the [Backup an existing GnuPG setup](https://wiki.gentoo.org/wiki/Project:Infrastructure/Generating_GLEP_63_based_OpenPGP_keys#Step_2:_Backup_an_existing_GnuPG_setup)
from the Gentoo Wiki (replacing the `.gnupg` with the path or `$GNUPGHOME` if it is not the default).


Eg. exporting the homedir

```shell
(umask 077 && tar -caf $HOME/gnupg-backup_`date +%Y%m%d_%H%M%S`.tar.xz -C ${HOME} .gnupg)
```

Which restricts access to the tarball of the `$GNUPGHOME` directory.

#### Strip the secret primary key for safety

Here we follow the [Gentoo Wiki](https://wiki.gentoo.org/wiki/GnuPG#Removing_the_secret_primary_key_for_safety) again, some
other approaches will also get the job done:

- <https://wiki.debian.org/Subkeys> "How?" Section


```shell
gpg --output secret.gpg --armor --export-secret-key <keyid>
gpg --output subkeys.gpg --armor --export-secret-subkeys <keyid>
gpg --delete-secret-keys <keyid>
gpg --import subkeys.gpg
gpg --list-secret-keys
# Should show your master certify key as `sec#`
```

In the above output the secret primary key _must_ be labeled as sec#

### Store the Private Artifacts

#### From The Root CA

Keep the Root CA Yubikeys in 2 different safe places.

#### From the PGP Keys

The private artifact to keep safe is the `secret.gpg` from the `gpg --output secret.gpg --armor --export-secret-key <keyid>` you ran previously.

Also you created a revocation certificate `revocation.txt` earlier, this should live with your master secret key.

### Export the Public Artifacts

#### From the Root CA

With a Root CA Yubikey inserted:

```shell
ykman piv keys export -F PEM 9C <path-to-output-file>
```

The 9C is the signature slot for the PIV application. The output path is the Root Certificate to trust.

#### From the Intermediate CA

The Intermediate CA Yubikey is the only thing that has the secrets for the Intermediate CA, keep it safe but that is what you should be using to sign CSR's.

#### From the PGP Keys

Your public pgp key to share:

```shell
gpg --output pubkey.pub --export <keyid>
```

`pubkey.pub` is what you then advertise / upload to the applicable keyservers

Your secrets to keep on your machines:

```shell
gpg --output subkeys.gpg --armor --export-secret-subkeys <keyid>
```

Should be the `subkeys.gpg` you created previously
