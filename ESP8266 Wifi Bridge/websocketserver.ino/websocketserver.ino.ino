#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>    //https://github.com/Links2004/arduinoWebSockets/issues/61
#include <Hash.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>         //https://github.com/tzapu/WiFiManager
#include <ArduinoOTA.h>

// Transparent Serial Bridge code from Marcus https://github.com/Links2004/arduinoWebSockets/issues/61

WebSocketsServer webSocket = WebSocketsServer(80);

#define SEND_SERIAL_TIME (50)

class SerialTerminal {
    public:
        void setup() {
            _lastRX = 0;
            resetBuffer();
            Serial.begin(115200);

        }

        void loop() {
            unsigned long t = millis();
            bool forceSend = false;

            size_t len = (_bufferWritePtr - &_buffer[0]);
            int free = (sizeof(_buffer) - len);

            int available = Serial.available();
            if(available > 0 && free > 0) {
                int readBytes = available;
                if(readBytes > free) {
                    readBytes = free;
                }
                readBytes = Serial.readBytes(_bufferWritePtr, readBytes);
                _bufferWritePtr += readBytes;
                _lastRX = t;
            }

            // check for data in buffer
            len = (_bufferWritePtr - &_buffer[0]);
            if(len >=  sizeof(_buffer)) {
                forceSend = true;
            }
            if(len > (WEBSOCKETS_MAX_HEADER_SIZE + 1)) {
                if(((t - _lastRX) > SEND_SERIAL_TIME) || forceSend) {
                    //Serial1.printf("broadcastBIN forceSend: %d\n", forceSend);
                    webSocket.broadcastTXT(&_buffer[0], (len - WEBSOCKETS_MAX_HEADER_SIZE), true);
                    resetBuffer();
                }
            }
        }


    protected:
        uint8_t _buffer[1460];
        uint8_t * _bufferWritePtr;
        unsigned long _lastRX;

        void resetBuffer() {
            // offset for adding Websocket header
            _bufferWritePtr = &_buffer[WEBSOCKETS_MAX_HEADER_SIZE];
            // addChar('T');
        }

        inline void addChar(char c) {
            *_bufferWritePtr = (uint8_t) c; // message type for Webinterface
            _bufferWritePtr++;
        }
};

SerialTerminal term;

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {
    switch(type) {
        case WStype_DISCONNECTED:
//            Serial1.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
//            Serial1.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
            // send message to client
            webSocket.sendTXT(num, "Connected");
        }
            break;
        case WStype_TEXT:
//            Serial1.printf("[%u] get Text: %s\n", num, payload);
            if(lenght > 0) {
                Serial.write((const char *) (payload), (lenght));
            }
            break;
    }
}

void setup()
{
    // use Serial 1 for debug out
//    Serial1.begin(921600);
//    Serial1.setDebugOutput(true);

//    Serial1.println();
//    Serial1.println();
//    Serial1.println();

    for(uint8_t t = 4; t > 0; t--) {
//        Serial1.printf("[SETUP] BOOT WAIT %d...\n", t);
        delay(1000);
    }

//    Serial1.printf("[SETUP] HEAP: %d\n", ESP.getFreeHeap());

    WiFiManager wifiManager;
    //wifiManager.resetSettings();    
        
    wifiManager.autoConnect("Emblaser2");

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    term.setup();

    // disable WiFi sleep for more performance
    WiFi.setSleepMode(WIFI_NONE_SLEEP);

    ArduinoOTA.setHostname("Emblaser2");
    ArduinoOTA.begin();
}


void loop()
{
    ArduinoOTA.handle();
    term.loop();
    webSocket.loop(); 
}
