# LaserWeb

As this project pushes forward (with the brilliant direction of Peter Van der Waalt at the helm, and some very talented contributors), please remember taht Rome wsn't built in a day. This is a totally non profit open source project, all contributors and testers are volunteers who share a love of all things making. lasers included. That being said, if history has anything to say about it, this project should advance very quickly. (A fourth version is already in the beggining stages)Check the LaserWeb/CNCWeb Google+ community (https://plus.google.com/u/0/communities/115879488566665599508) for updates on the progress of the newest iteration of LaserWeb.



## Documentation:

We have a pretty detailed Wiki on [https://github.com/openhardwarecoza/LaserWeb3/wiki](https://github.com/openhardwarecoza/LaserWeb3/wiki) - with details of Installing LaserWeb, Common application Workflows, Firmware setup tricks, and help for setting up LaserWeb's settings


## Contact Us if you need help! We can't fix bugs if we don't hear about them (;

Link to Support Community: [https://plus.google.com/communities/115879488566665599508](https://plus.google.com/communities/115879488566665599508)

Link to Youtube Playlist with LaserWeb videos: [https://www.youtube.com/playlist?list=PL1JTb6-HQgOyc1eM6eX4v0tdSYpXFLYNT](https://www.youtube.com/playlist?list=PL1JTb6-HQgOyc1eM6eX4v0tdSYpXFLYNT)

Link to authors other projects:  [https://openhardwarecoza.github.io/donate](https://openhardwarecoza.github.io/donate)

## Disclaimer
By using this software, the user accepts complete responsibility for each and every aspect of safety associated with the use of the Laser machine, Laser system and LaserWeb Software.

####You agree that:

1. You will not hold the author or contributors of LaserWeb3 liable for any damage to equipment or persons from the use of LaserWeb. 
2. You know the potential hazards in using high power lasers and high voltages.
3. You will wear professional laser-eye-protection when using a laser controlled by LaserWeb.
4. You will use the LaserWeb software in a legal and safe manner.
5. You relieve the author and contributors from any liability arising from the use or distribution of the LaserWeb software.
6. You are entirely operating at your own risk. Lasers can be lethally dangerous. 

## What's new / planned for LaserWeb 

* A ground up rewrite of the serial comms layer (In progress:  Smoothieware support is done, Marlin support is available for testing and further development, and Grbl support needs to be written next) 
* A new tabbed multilayer CAM system that allows you to load dxfs, svgs, stls and rasters into the SAME job! (Implemented, needs testing)
* A new costing estimate module - for those of you who make money out of your lasers - should help you qoute just a little more accurate (Already implemented)
* Smoothieware Ethernet support (nearly done)
* Rotary Axis Support (planned)

![Screenshot](https://raw.githubusercontent.com/openhardwarecoza/LaserWeb3/master/screenshot.png)

## Supported firmwares

Note: Ever changing.  See the Issues tab above for details.

| Firmware      | Supported by LW  | Raster Grayscale  |Realtime Feedback  |Pull Requests Accepted  |
| ------------- |------------------| :----------------:|:-----------------:|:----------------------:|
| Smoothieware  | Fully            |   Yes             |   Yes             | Yes - improvements     |
| Marlin        | Not yet          |   **Yes, but...   |   No              | Yes - test and improve | 
| Grbl          |Implemented Jul'16| **Yes,  but...    |   almost          | Yes - improved  error handling  |
| TinyG         | not planned      |   No              |   Yes             | Yes - please           |
| Repetier      | not planned      |   No              |   No              | Yes                    |

Long story short:  Smoothieware wins on all fronts.  its the ONLY open source firmware which automatically modulates its laser power output according to the realtime acceleration values - ensuring that (de)acceleration does not cause larger kerf / darker engraves - which the other firmwares causes.   This is a MUST for good Raster engraving, and is needed for Raster Grayscale!

Smoothieware is also a massively faster (up to 120Mhz vs the 16Mhz of the Arduino based controllers) - which means we can pull near realtime feedback from the controller. This keeps the UI massively responsive, and ensures you are always aware of what your machine is doing. 

`**`Marlin and Grbl Firmwares support grayscale, but don't modulate power according to acceleration: Thus start/end of raster moves burn a little darker.  On some machines / some graphics, this can really look bad, so i'd rather not say "yes" since the experience is not what it could be.  Again, Smoothieware is sooo much better at this!


