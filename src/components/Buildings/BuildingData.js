
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getAllRecords1, getAllRecords2 ,getAllRecords3} from "../../graphql/queries";
import { generateClient } from "aws-amplify/api";
import Navigation from "../../Navigation";
 
const client = generateClient();
 
const BuildingData = ({ location }) => {
  const [objectData, setObjectData] = useState([]);
  const [siteData, setSiteData] = useState(null);
  const [selectedAreaData, setSelectedAreaData] = useState([]);
  const [pointData, setPointData] = useState(null);
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
    if (siteData && objectData) {
      const matchingSerialNumbers = siteData.map((site) => site.SerialNumber);
      const filteredAreaData = objectData.filter((record) => {
        const parts = record.ObjectMap.split("#");
        return (
          parts.length >= 3 &&
          location.state.selectedBuilding.includes(parts[1]) &&
          matchingSerialNumbers.includes(parts[0])
        );
      });
      setSelectedAreaData(filteredAreaData);
    }
  }, [siteData, objectData, location.state]);
 
  const handleGoBack = () => {
    history.push("/");
  };
 
  const parseobject = (objectMap) => {
    const parts = objectMap.split("#");
    return parts.length >= 3 && location.state.selectedBuilding.includes(parts[1]) ? parts[2] : null;
  };
  const parseobject1 = objectmap => {
    const parts = objectmap.split("#");
    return parts.length >= 3 && location.state.selectedBuilding.includes(parts[1])? parts[3] : null;
};
  const getValueForProperty = (record, property) => {
    console.log("record",record);
    console.log("data",pointData);
    if (pointData && record) {
      const objectParts = record.ObjectMap.split("#");
      const propertyValues = pointData.filter(point => {
        const pointParts = point.PointMap.split("#");
        return (
          pointParts.length >= 4 &&
          objectParts.length >= 3 &&
          pointParts.slice(0, 3).join("#") === objectParts.slice(0, 3).join("#") &&
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
 
  const headerMapping = {
    area: {
      Name: (record) => parseobject(record.ObjectMap),
      InsideTemperature: (record) => getValueForProperty(record, "spaceSetpoint"),
      ActiveSetpoint: (record) => getValueForProperty(record, "activeSetpoint"),
      HeatCoolMode: (record) => getValueForProperty(record, "heatCoolModeStatus"),
      PresentValue: (record) => getValueForProperty(record, "occupancyStatus"),
    },
    space: {
      Name: (record) => parseobject(record.ObjectMap),
      ActiveSetPoint: (record) => getValueForProperty(record, "activeSetpoint"),
      EquipmentType: (record) => parseobject1(record.ObjectMap),
      HeatCoolMode: (record) => getValueForProperty(record, "HeatCoolModeStatus"),
      SpaceTemperatureActive: (record) => getValueForProperty(record, "SpaceTempSetpointActive"),
    },
    chiller: {
      Name: (record) => parseobject(record.ObjectMap),
      EnteringWaterTemperature: (record) => getValueForProperty(record, "EnteringWaterTemperature"),
      LeavingWaterTemperature: (record) => getValueForProperty(record, "LeavingWaterTemperature"),
      RunningMode: (record) => getValueForProperty(record, "RunningMode"),
    },
    airhandler: {
      Name: (record) => parseobject(record.ObjectMap),
      DuctStaticPressure: (record) => getValueForProperty(record, "DuctStaticPressure"),
      DuctStaticPressureSetpoint: (record) => getValueForProperty(record, "DuctStaticPressureSetpoint"),
      DischargeAirTemperature: (record) => getValueForProperty(record, "DischargeAirTemperature"),
      DischargeAirTemperatureSetpoint: (record) => getValueForProperty(record, "DischargeAirTemperatureSetpoint"),
    },
    vas: {
      Name: (record) => parseobject(record.ObjectMap),
      Occupancy: (record) => getValueForProperty(record, "Occupancy"),
      OperatingMode: (record) => getValueForProperty(record, "OperatingMode"),
    },
    cpc: {
      Name: (record) => parseobject(record.ObjectMap),
      ChilledWaterSetpoint: (record) => getValueForProperty(record, "ChilledWaterSetpoint"),
      ReturnWaterTemperature: (record) => getValueForProperty(record, "ReturnWaterTemperature"),
      SupplyWaterTemperature: (record) => getValueForProperty(record, "SupplyWaterTemperature"),
      FlowStatus: (record) => getValueForProperty(record, "FlowStatus"),
      BypassFlow: (record) => getValueForProperty(record, "BypassFlow"),
    },
  };
 
  return (
    <div>
      <div>
        <Navigation />
      </div>
      <button onClick={handleGoBack} className="Button2">
        Go back
      </button>
      {Object.entries(headerMapping).map(([buildingType, headerMappings]) => (
        <div key={buildingType}>
          <h2>{buildingType}</h2>
          <div className="TableData">
            {selectedAreaData && selectedAreaData.length > 0 ? (
              <table className="kiran" cellSpacing="0" cellPadding="0">
                <thead className="table-Style">
                  <tr>
                    {Object.keys(headerMappings).map((header, index) => (
                      <th key={index} className="th-Style">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedAreaData
                    .filter((record) => record.ObjectMap.includes(`#${buildingType}#`))
                    .map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? "table-even" : "table-Row"}>
                     
                        {Object.keys(headerMappings).map((header, index) => (
                          <td key={index} className="td-Style">
                            {headerMappings[header](record)}
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
      ))}
    </div>
  );
};
 
export default BuildingData;