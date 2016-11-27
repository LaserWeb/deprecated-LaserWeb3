### v1.4
	* Added possibility to open and close the numpad programmatically: <code>$(selector).numpad('open')</code> and <code>$(selector).numpad('close')</code> 

### v1.3.1
   	* Registered the plugin in the npm repository.

### v1.3
   	* Added support for negative numbers and an appropriate button.
	* Added support for fractions and a corresponding decimal button.
	* Removed the plus and minus button to save space.
	* Fixed changing multiple elements at the same time when the numpad is used for a collection (e.g. table column).

### v1.2.1
    * Fixed maxlength parameter for the numpad display. Additionally it is now inherited from the original input field (target).

### v1.2
    * Added <code>onChange</code> callback and corresponding <code>numpad.change</code> event triggered every time the user changes the value displayed on the keypad.
	* Pressing done now triggers a change event on the target input - just like regular keyboard typing would do 
	
### v1.1
    * Added <code>onKeypadOpen</code> and <code>onKeypadClose</code> callbacks and corresponding <code>numpad.open</code> and <code>numpad.close</code> events

### v1.0.1
    * Added support for Bootstrap
    * Added Bootstrap demo

### v1.0
    * Initial Releas