# LaserWeb

Check the LaserWeb/CNCWeb Google+ community (https://plus.google.com/u/0/communities/115879488566665599508) for updates on the progress of the newest iteration of LaserWeb.

Donations to the developers to further things along are always welcome, but even if you can not contribute financially, if you use LaserWeb and like it, spread the word around. More users translates into more contributors which then allows for faster, feature rich development.

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

## Wishlist

If you want to contribute, the below are long standing community-requested enhancements, that a) we don't have time to code or b) don't know how to

* GCODE Optimiser - to cut down on G0 moves (something like http://parano.github.io/GeneticAlgorithm-TSP/)
* Realtime commands:  Our present implementation adds commands to the back of the queue, we need some code enhancement to do `if playing == true, then prepend the following commands to the front of the queue` for things like feedrate / power / spindle override
* More Controllers! Help us code up the Marlin and TinyG interfaces
* Smoothieware Ethernet - is about halfway done - if you'd like to help, please continue on from https://github.com/openhardwarecoza/LaserWeb3/issues/16
* Rotary Support - initial groundwork is done - but needs a lot of work to be fully usable https://github.com/openhardwarecoza/LaserWeb3/issues/51
* Vendor specific enhancements (PAID WORK OPPORTUNITY) - there are a few vendor specific enhancements, that companies are willing to pay to get done... See the labels on the Issues page, for example Emblaser/DarklyLabs: https://github.com/openhardwarecoza/LaserWeb3/issues?q=is%3Aissue+is%3Aopen+label%3A%22EMBLASER+%2F+DARKLYLABS%22
