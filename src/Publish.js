
import React, { useState, useEffect } from "react";
import { mqtt5, auth, iot } from "aws-iot-device-sdk-v2";
 
const PublishAndSubscribe = () => {
 
  const [serialNumber, setSerialNumber] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
 

  const [mqttClient, setMqttClient] = useState(null);
  const [statusMessages, setStatusMessages] = useState([]);
  const [discoverMessages, setDiscoverMessages] = useState([]);
 

  const addStatusMessage = (message) => {
    setStatusMessages((prevMessages) => [...prevMessages, message]);
  };
 
  // Effect to initialize MQTT client
  useEffect(() => {
    const initMqttClient = async () => {
      const provider = new auth.AWSCognitoCredentialsProvider({
        IdentityPoolId: "ap-south-1:d1d9188d-8a65-4d13-bd76-fd51362d9945",
        Region: "ap-south-1",
      });
 
      const wsConfig = {
        credentialsProvider: provider,
        region: "ap-south-1",
      };
 
      const builder = iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth(
        "a3317ptiejt6p9-ats.iot.ap-south-1.amazonaws.com",
        wsConfig
      );
 
      const client = new mqtt5.Mqtt5Client(builder.build());
      setMqttClient(client);
 
      client.start();
      client.on("messageReceived", (eventData) => {
        const messagePayload = JSON.parse(new TextDecoder().decode(eventData.message.payload));
        console.log("Subscription:", messagePayload);
        setDiscoverMessages((prevMessages) => [...prevMessages, messagePayload]);
        addStatusMessage(`Received message on ${eventData.topic}: ${messagePayload.Message}`);
      });
 
      await client.subscribe({
        subscriptions: [{ topicFilter: "discoverState" }],
      });
 
      addStatusMessage("MQTT client initialized and subscribed.");
    };
 
    initMqttClient();
 
    return () => {
      if (mqttClient) {
        mqttClient.stop();
        console.log('MQTT client stopped');
        addStatusMessage("MQTT client stopped.");
      }
    };
  }, []);
 

  const publishToDiscoveryRequest = async () => {
    if (mqttClient) {
      const message = {
        serialNumber,
        name,
        organization,
        address: { city, state, country, postalCode },
      };
      const qos = mqtt5.QoS.AtLeastOnce;
      const payload = JSON.stringify(message);
      const topicName = "discoveryRequest";
      try {
        const publishResult = await mqttClient.publish({
          qos,
          topicName,
          payload,
        });
        console.log("Publish Result:", publishResult);
        addStatusMessage("Site data pushed successfully!");
      } catch (error) {
        console.error("Error publishing message:", error);
        addStatusMessage("Failed to push site data.");
      }
    }
  };
 
  return (
    <div className="publish-subscribe">
      <div className="publish">
        <h2 style={{ color: "white", position: "relative", bottom: "20px" }}>
          Publish to topicToPublish:
        </h2>
        <div className="container3">
          <div>
            <label>Serial Number:</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "62px" }}>name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "13px" }}>organization:</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "77px" }}>city:</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "67px" }}>state:</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "46px" }}>country:</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div>
            <label style={{ marginRight: "19px" }}>postalCode:</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <br />
        </div>
        <button
          style={{ position: "relative", left: "85px" }}
          onClick={publishToDiscoveryRequest}
        >
           Discovery 
        </button>
      </div>
      <div className="subscribe">
        {discoverMessages.map((message, index) => (
          <p key={index}>Topic: {message.topic}, Message: {message.payload}</p>
        ))}
      </div>
      <div className="status-messages">
        {statusMessages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </div>
  );
};
 
export default PublishAndSubscribe;

