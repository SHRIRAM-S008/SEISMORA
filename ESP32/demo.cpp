#include <WiFi.h>
#include <HTTPClient.h>
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
String supabaseUrl = "https://yjpuxdjkndjshreruqsj.supabase.co/rest/v1/sensor_data";
String apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcHV4ZGprbmRqc2hyZXJ1cXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzg4MDcsImV4cCI6MjA4MDY1NDgwN30.va6pjKZohg63xLRrxTqO9VmZdCpiaUx_99YHdnr6D6E";

void setup() {
  Serial.begin(115200);
  Serial.println("Connecting to WiFi...");
  
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected! IP Address: ");
  Serial.println(WiFi.localIP());
}
void loop() {
  float pressure = random(20, 40);  
  float flex = random(10, 25);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(supabaseUrl);                      
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", apiKey);
    http.addHeader("Prefer", "return=minimal");

    String body = "{\"pressure\":" + String(pressure) + ",\"flex\":" + String(flex) + "}";

    Serial.println("Sending payload:");
    Serial.println(body);

    int httpResponseCode = http.POST(body);

    Serial.print("Supabase response: ");
    Serial.println(httpResponseCode);

    http.end(); 
  } else {
    Serial.println("WiFi disconnected!");
  }

  delay(1000); 
}