import React, { useEffect, useState } from "react";
import { getAllRecords1, getAllRecords2, getAllRecords3 } from "../../graphql/queries";
import { generateClient } from "aws-amplify/api";
import "../../NativeCloudBMS.css";
import Navigation from "../../Navigation";
import { useHistory } from "react-router-dom";
 
const client = generateClient();
 
const SelectedItem = ({ location }) => {
    const [objectData, setObjectData] = useState([]);
    const [siteData, setSiteData] = useState(null);
    const [pointData, setPointData] = useState(null);
    const [selectedAreaData, setSelectedAreaData] = useState([]);
    const history = useHistory();
 
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result1 = await client.graphql({ query: getAllRecords1 });
          const result2 = await client.graphql({ query: getAllRecords2 });
          const result3 = await client.graphql({ query: getAllRecords3 });
          setSiteData(result1.data.getAllRecords1);
          setObjectData(result2.data.getAllRecords2);
          setPointData(result3.data.getAllRecords3)
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }, []);
 
    useEffect(() => {
        const matchingSerialNumbers = siteData ? siteData.map(site => site.SerialNumber) : [];
        const filteredAreaData = objectData.filter(record => {
            const parts = record.ObjectMap.split("#");
            return (
                parts.length >= 3 &&
                parts[1].startsWith(location.state.selectedItem) &&
                matchingSerialNumbers.includes(parts[0])
            );
        });
        setSelectedAreaData(filteredAreaData);
    }, [location.state.selectedItem, siteData, objectData]);
 
    const parseobject = objectmap => {
        const parts = objectmap.split("#");
        return parts.length >= 3 && parts[1] === location.state.selectedItem ? parts[2] : null;
    };
 
    const parseobject1 = objectmap => {
        const parts = objectmap.split("#");
        return parts.length >= 3 && parts[1] === location.state.selectedItem ? parts[3] : null;
    };
    const getValueForProperty = (record, property) => {
      if (pointData && record) {
        const objectParts = record.ObjectMap.split('#');
        const propertyValues = pointData.filter(point => {
          const pointParts = point.PointMap.split('#');
          return (
            pointParts.length >= 4 &&
            objectParts.length >= 3 &&
            pointParts.slice(0, 3).join('#') === objectParts.slice(0, 3).join('#') &&
            pointParts[3] === property
          );
        });
     
        if (propertyValues.length > 0) {
          propertyValues.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        
          const latestValue = propertyValues[0];
       
          return latestValue.Value;
        }
      }
      return null;
    };
  

 
    const headerMappings = {
        area: {
            Name: (record) => parseobject(record.ObjectMap),
            InsideTemperature: (record) => getValueForProperty(record, "spaceSetpoint"),
            ActiveSetpoint: (record) => getValueForProperty(record, "activeSetpoint"),
            HeatCoolMode: (record) => getValueForProperty(record, "heatCoolModeStatus"),
            PresentValue: (record) => getValueForProperty(record, "occupancyStatus"),
        },
    space: {
      Name: (record) => parseobject(record.ObjectMap),
      ActiveSetPoint:  (record) => getValueForProperty(record, "activeSetpoint"),
      EquipmentType: (record) => parseobject1(record.ObjectMap),
      HeatCoolMode: (record) => getValueForProperty(record, "HeatCoolModeStatus"),
      SpaceTemperatureActive: (record) => getValueForProperty(record, "SpaceTempSetpointActive"),
    },
    chiller: {
      Name: (record) => parseobject(record.ObjectMap),
      EnteringWaterTemperature: " Entering Water Temperature",
      LeavingWaterTemperature: "Leaving Water Temperature",
      RunningMode: " Running Mode",
    },
    airhandler: {
      Name: (record) => parseobject(record.ObjectMap),
      DuctStaticPressure: " Duct Static Pressure",
      DuctStaticPressureSetpoint: "DuctStaticPressureSetpoin",
      DischargeAirTemperature: "DischargeAirTemperature",
      DischargeAirTemperatureSetpoint: "DischargeAirTemperatureSetpoint",
    },
    vas: {
      Name: (record) => parseobject(record.ObjectMap),
      Occupancy: "Occupancy",
      OperatingMode: "Operating Mode",
    },
    cpc: {
      Name: (record) => parseobject(record.ObjectMap),
      ChilledWaterSetpoint: "Chilled Water Setpoint",
      ReturnWaterTemperature: "Return Water Temperature",
      SupplyWaterTemperature: "Supply Water Temperature",
      FlowStatus: "Flow Status",
      BypassFlow: "Bypass Flow",
    },
  };
  const headers = Object.keys(headerMappings[location.state.selectedItem]);


  const handleGoBack = () => {
    history.push("/");
  };


 
  return (
    <div>
      <div>
        <Navigation />
      </div>
      <button onClick={handleGoBack} className="Button2"> Go back </button>
      <div className="TableData">
        {selectedAreaData?.length > 0 ? (
          <table className="kiran" cellspacing="0" cellpadding="0">
            <thead className="table-Style">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="th-Style">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedAreaData.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? "table-even" : "table-Row"}>
                  {headers.map((header, index) => (
                    <td key={index} className="td-Style">
                      {typeof headerMappings[location.state.selectedItem][header] === "function" ?
                        headerMappings[location.state.selectedItem][header](record) :
                        record[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};
 
export default SelectedItem;