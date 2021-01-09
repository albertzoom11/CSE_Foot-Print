/* 
HEADER
File to gather force data from the sensors and send it over to the firestore

*/

#include <LiquidCrystal.h>
#define FIREBASE_HOST "https://wearable-sensor.firebaseapp.com/"                          // the project name address from firebase id
#define FIREBASE_AUTH "AIzaSyCmvs9m-dXkMfvD2ZDQxmyRaaeXe-KOuw4" 

unsigned char force;
int forces = [100];
int average;
void setup() { 
 Serial.begin(9600); 
 // connect to wifi. 
 WiFi.begin(WIFI_SSID, WIFI_PASSWORD); 
 Serial.print("connecting"); 
 while (WiFi.status() != WL_CONNECTED) { 
   Serial.print("."); 
   delay(500); 
 }
Serial.println(); 
 Serial.print("connected: "); 
 Serial.println(WiFi.localIP()); 
 Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH); 
void loop() //get the force data and send it tot he average force function
{
  // set value 
 Firebase.setFloat("number", 42.0); 
 // handle error 
 if (Firebase.failed()) { 
     Serial.print("setting /number failed:"); 
     Serial.println(Firebase.error());   
     return; 
  force = obtain_force();
  AverageForce(force);
 
}

void AverageForce(unsigned int k)   //calculate the average force by adding all data to a list
{
  forces.append(k)
  if (k = 0)
  {
    obtain_force()
  }
}

int obtain_force() //actually calculates the average and returns it
{
  float adc = 0;
  float total = 0;
  
  average = sum(forces)/len(forces);         // Get the average value
  return average;
}
Firebase.pushString("AverageForce", average);                                  //setup path and send readings


