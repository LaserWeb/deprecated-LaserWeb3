/**************************************************************
   WiFiManager is a library for the ESP8266/Arduino platform
   (https://github.com/esp8266/Arduino) to enable easy
   configuration and reconfiguration of WiFi credentials using a Captive Portal
   inspired by:
   http://www.esp8266.com/viewtopic.php?f=29&t=2520
   https://github.com/chriscook8/esp-arduino-apboot
   https://github.com/esp8266/Arduino/tree/esp8266/hardware/esp8266com/esp8266/libraries/DNSServer/examples/CaptivePortalAdvanced
   Built by AlexT https://github.com/tzapu
   Licensed under MIT license
 **************************************************************/

#ifndef WiFiManager_h
#define WiFiManager_h

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <memory>

extern "C" {
  #include "user_interface.h"
}

const char HTTP_HEAD[] PROGMEM            = "<!DOCTYPE html><html lang=\"en\"><head><meta name=\"viewport\"content=\"width=device-width,initial-scale=1,user-scalable=no\"/><title>{v}</title>";
const char HTTP_STYLE[] PROGMEM           = "<style> .c{text-align:center;}div,input{padding:5px;font-size:1em;}body{text-align:center;font-family:verdana;background-color: #000;color: #fff} button{border:0;border-radius:0.3rem;background-color:#ff7b00;color:#000;line-height:2.4rem;font-size:1.2rem;width:100%;} .q{float:right;width:64px;text-align:right;} .l{background:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoLERoBne8tiAAAADBQTFRFAAAADw8PHh4ePT09XFxcbGxsfHx8i4uLmpqaqampubm5x8fH1dXV4eHh4uLi////kbwu4gAAAAFiS0dEDxi6ANkAAABeSURBVCjPY2AgEnjevTsFmS91FwgWIviMe0ECtwXgApx37xWbnr07AS5ge3cTSNtluEDvXQWgvrM34AJ7wczY23CBu9cgGqkowHMXDg6ABXgRAheGvwAfQuABMdEOANNywA7TlE/KAAAAAElFTkSuQmCC\")no-repeat left center;background-size:1em;}a {color:#ff7b00;}input{ border:solid 1px#ff7b00;box-shadow:0 0 5px 1px#ff7b00;background-color: #222;color: #fff;width:95%;} </style>";
const char HTTP_SCRIPT[] PROGMEM          = "<script>function c(l){document.getElementById('s').value=l.innerText||l.textContent;document.getElementById('p').focus();} </script>";
const char HTTP_HEAD_END[] PROGMEM        = "</head><body><div style=\"text-align:left;display:inline-block;min-width:260px;\"><img src=data:image/png;base64,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>";
const char HTTP_PORTAL_OPTIONS[] PROGMEM  = "<form action=\"/wifi\"method=\"get\"><button>Configure WiFi</button></form><br/><form action=\"/0wifi\"method=\"get\"><button>Configure WiFi(No Scan)</button></form><br/><form action=\"/i\"method=\"get\"><button>Info</button></form><br/><form action=\"/r\"method=\"post\"><button>Reset</button></form>";
const char HTTP_ITEM[] PROGMEM            = "<div><a href='#p'onclick='c(this)'>{v}</a>&nbsp;<span class='q{i}'>{r}%</span></div>";
const char HTTP_FORM_START[] PROGMEM      = "<form method='get'action='wifisave'><input id='s'name='s'length=32 placeholder='SSID'><br/><input id='p'name='p'length=64 type='password'placeholder='password'><br/>";
const char HTTP_FORM_PARAM[] PROGMEM      = "<br/><input id='{i}'name='{n}'length={l}placeholder='{p}'value='{v}' {c}>";
const char HTTP_FORM_END[] PROGMEM        = "<br/><button type='submit'>save</button></form>";
const char HTTP_SCAN_LINK[] PROGMEM       = "<br/><div class=\"c\"><a href=\"/wifi\">Scan</a></div>";
const char HTTP_SAVED[] PROGMEM           = "<div>Credentials Saved<p>Trying to connect your Emblaser2 to network... </p></div><div><p>If it fails, please reconnect to the 'Emblaser2' access point to try again</p></div><div><p>If the connection is successful, then a few moments from now, you can try connecting from LaserWeb</p></div>";
const char HTTP_END[] PROGMEM             = "</div></body></html>";



#define WIFI_MANAGER_MAX_PARAMS 10

class WiFiManagerParameter {
  public:
    WiFiManagerParameter(const char *custom);
    WiFiManagerParameter(const char *id, const char *placeholder, const char *defaultValue, int length);
    WiFiManagerParameter(const char *id, const char *placeholder, const char *defaultValue, int length, const char *custom);

    const char *getID();
    const char *getValue();
    const char *getPlaceholder();
    int         getValueLength();
    const char *getCustomHTML();
  private:
    const char *_id;
    const char *_placeholder;
    char       *_value;
    int         _length;
    const char *_customHTML;

    void init(const char *id, const char *placeholder, const char *defaultValue, int length, const char *custom);

    friend class WiFiManager;
};


class WiFiManager
{
  public:
    WiFiManager();

    boolean       autoConnect();
    boolean       autoConnect(char const *apName, char const *apPassword = NULL);

    //if you want to always start the config portal, without trying to connect first
    boolean       startConfigPortal(char const *apName, char const *apPassword = NULL);

    // get the AP name of the config portal, so it can be used in the callback
    String        getConfigPortalSSID();

    void          resetSettings();

    //sets timeout before webserver loop ends and exits even if there has been no setup.
    //usefully for devices that failed to connect at some point and got stuck in a webserver loop
    //in seconds setConfigPortalTimeout is a new name for setTimeout
    void          setConfigPortalTimeout(unsigned long seconds);
    void          setTimeout(unsigned long seconds);

    //sets timeout for which to attempt connecting, usefull if you get a lot of failed connects
    void          setConnectTimeout(unsigned long seconds);


    void          setDebugOutput(boolean debug);
    //defaults to not showing anything under 8% signal quality if called
    void          setMinimumSignalQuality(int quality = 8);
    //sets a custom ip /gateway /subnet configuration
    void          setAPStaticIPConfig(IPAddress ip, IPAddress gw, IPAddress sn);
    //sets config for a static IP
    void          setSTAStaticIPConfig(IPAddress ip, IPAddress gw, IPAddress sn);
    //called when AP mode and config portal is started
    void          setAPCallback( void (*func)(WiFiManager*) );
    //called when settings have been changed and connection was successful
    void          setSaveConfigCallback( void (*func)(void) );
    //adds a custom parameter
    void          addParameter(WiFiManagerParameter *p);
    //if this is set, it will exit after config, even if connection is unsucessful.
    void          setBreakAfterConfig(boolean shouldBreak);
    //if this is set, try WPS setup when starting (this will delay config portal for up to 2 mins)
    //TODO
    //if this is set, customise style
    void          setCustomHeadElement(const char* element);
    //if this is true, remove duplicated Access Points - defaut true
    void          setRemoveDuplicateAPs(boolean removeDuplicates);

  private:
    std::unique_ptr<DNSServer>        dnsServer;
    std::unique_ptr<ESP8266WebServer> server;

    //const int     WM_DONE                 = 0;
    //const int     WM_WAIT                 = 10;

    //const String  HTTP_HEAD = "<!DOCTYPE html><html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>{v}</title>";

    void          setupConfigPortal();
    void          startWPS();

    const char*   _apName                 = "no-net";
    const char*   _apPassword             = NULL;
    String        _ssid                   = "";
    String        _pass                   = "";
    unsigned long _configPortalTimeout    = 0;
    unsigned long _connectTimeout         = 0;
    unsigned long _configPortalStart      = 0;

    IPAddress     _ap_static_ip;
    IPAddress     _ap_static_gw;
    IPAddress     _ap_static_sn;
    IPAddress     _sta_static_ip;
    IPAddress     _sta_static_gw;
    IPAddress     _sta_static_sn;

    int           _paramsCount            = 0;
    int           _minimumQuality         = -1;
    boolean       _removeDuplicateAPs     = true;
    boolean       _shouldBreakAfterConfig = false;
    boolean       _tryWPS                 = false;

    const char*   _customHeadElement      = "";

    //String        getEEPROMString(int start, int len);
    //void          setEEPROMString(int start, int len, String string);

    int           status = WL_IDLE_STATUS;
    int           connectWifi(String ssid, String pass);
    uint8_t       waitForConnectResult();

    void          handleRoot();
    void          handleWifi(boolean scan);
    void          handleWifiSave();
    void          handleInfo();
    void          handleReset();
    void          handleNotFound();
    void          handle204();
    boolean       captivePortal();

    // DNS server
    const byte    DNS_PORT = 53;

    //helpers
    int           getRSSIasQuality(int RSSI);
    boolean       isIp(String str);
    String        toStringIp(IPAddress ip);

    boolean       connect;
    boolean       _debug = true;

    void (*_apcallback)(WiFiManager*) = NULL;
    void (*_savecallback)(void) = NULL;

    WiFiManagerParameter* _params[WIFI_MANAGER_MAX_PARAMS];

    template <typename Generic>
    void          DEBUG_WM(Generic text);

    template <class T>
    auto optionalIPFromString(T *obj, const char *s) -> decltype(  obj->fromString(s)  ) {
      return  obj->fromString(s);
    }
    auto optionalIPFromString(...) -> bool {
      DEBUG_WM("NO fromString METHOD ON IPAddress, you need ESP8266 core 2.1.0 or newer for Custom IP configuration to work.");
      return false;
    }
};

#endif
