# LaserWeb3

## Development Version

Note: Version 3 (this one) is currently in early development phase!

If you want to help develop or test, this is the right place to be. BUT... If you are just an average user, for now, rather use http://openhardwarecoza.github.io/LaserWeb2 (version 2 - the previous stable version)

## What's new / planned for LaserWeb 3

* A ground up rewrite of the serial comms layer
* A new tabbed multilayer CAM system that allows you to load dxfs, svgs, stls and rasters into the SAME job!
* A cnew costing estimate module - for those of you who make money out of your lasers - should help you qoute just a little more accurate
* Smoothieware Ethernet support
* 

![Screenshot](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb3/master/screenshot.jpg)

## Install Instructions

[https://github.com/openhardwarecoza/LaserWeb3/wiki/Installation-Instructions](https://github.com/openhardwarecoza/LaserWeb3/wiki/Installation-Instructions)

## Supported firmwares

Note: Ever changing.  See the Issues tab above for details.

| Tables        | Supported by LW3 | Raster Grayscale  |Realtime Feedback  |
| ------------- |------------------| :----------------:|:-----------------:|
| Smoothieware  | Fully            |   Yes             |   Yes             |
| Marlin        | In Alpha         |   No              |   No              |
| Repetier      | not planned      |   No              |   No              |
| Grbl          | planned          |   No              |   No              |

Long story short:  Smoothieware wins on all fronts.  its the ONLY open source firmware which automatically modulates its laser power output according to the realtime acceleration values - ensuring that (de)acceleration does not cause larger kerf / darker engraves - which the other firmwares causes.   This is a MUST for good Raster engraving, and is needed for Raster Grayscale!

Smnoothieware is also a massively faster (up to 120Mhz vs the 16Mhz of the Arduino based controllers) - which means we can pull near realtime feedback from the controller. This keeps the UI massively responsive, and ensures you are always aware of what your machine is doing. 


