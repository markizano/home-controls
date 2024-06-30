# HomeControls

This project was created as a way to give me a personal control panel to control and communicate among my android- and linux-based devices. I feel insufficient as a native Android developer, so I am compensating with my Angluar-fu and ExpressJS-fu. In this way, my devices can communicate in ways apps and cables cannot.

# Synopsis

The server component is written in ExpressJS but compiled from TypeScript to help with keeping data structures consistent.

The service runs on a Linux machine with or without an X server and Pulseaudio for the audio service. (I would like to explore and support JACK in future #FutureFeature).

The client runs in a browser on a remote device.

The client can control the server in various ways. The server can communicate with clients in various ways.

I can expand on this as I develop out more ideas. However, this is now a repository and a means by which I can build out these features.

# Features

## Audio Controls
With the server plugged into Pulse as an audio client, you can control the volume without being connected to the keyboard. By default uses a 3% step in volume (@TODO make this a configurable).

## Clipboard Management
Far too often, I am left with data on either mobile or laptop or server clipboard data that I want to transfer to the other. Using the "note to self" feature on Signal-Desktop and Signal-Android is okay, but something more seamless would be nice. This now grants me a button to directly copy and paste from mobile to laptop.

# Wishlist
- Authentication and Security: I understand this app is an incredible insecurity if exposed in the wrong ways. Mitigate this with a minimal level of authentication and security.
- Messaging: Toast messages from server to clients? Broadcast/subscription abilities.
