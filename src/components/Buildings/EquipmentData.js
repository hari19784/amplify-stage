import React, { useEffect, useState } from 'react';
import { getAllRecords1, getAllRecords2, getAllRecords3 } from "../../graphql/queries";
import { generateClient } from 'aws-amplify/api';
import '../../NativeCloudBMS.css';
import Navigation from '../../Navigation';
import { useHistory } from 'react-router-dom';
 
const client = generateClient();
 
const EquipmentData = ({ location, selectedData }) => {
  const history = useHistory();
  const [objectData, setObjectData] = useState([]);
  const [filteredObjectData, setFilteredObjectData] = useState([]);
  const [siteData, setSiteData] = useState(null);
  const [pointData, setPointData] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result1 = await client.graphql({ query: getAllRecords1 });
        const result2 = await client.graphql({ query: getAllRecords2 });
        const result3 = await client.graphql({ query: getAllRecords3 });
        setSiteData(result1.data.getAllRecords1);
        setObjectData(result2.data.getAllRecords2);
        setPointData(result3.data.getAllRecords3);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
 
  useEffect(() => {
    if (location.state1 && location.state1['selectedData'] && objectData.length > 0) {
      const filteredData = objectData.filter(record => {
        const parts = record.ObjectMap.split("#");
        return parts[2] === location.state1['selectedData'];
      });
      setFilteredObjectData(filteredData);
    } else {
      setFilteredObjectData([]);
    }
  }, [location.state1, siteData, objectData]);
 
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
 
  const handleGoBack = () => {
    history.push("/");
  };
 
  return (
    <div>
      <Navigation />
      <button onClick={handleGoBack} className='Button2'>Go back</button>
      <div style={{ position: 'relative', left: '130px', top: '80px' }}>
        {filteredObjectData?.length > 0 ? (
          <table className="kiran" cellSpacing="0" cellPadding="0">
            <thead className="table-Style">
              <tr>
               
                <th className="th-Style">Keyname</th>
                <th className="th-Style">Current Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjectData.map((record, index) => {
                const points = JSON.parse(record.Points.replace(/'/g, '"'));
                return points.map((point, i) => (
                  <tr key={`${index}-${i}`} className="table-tr">
                  
                    <td className="table-dataStyle">{point.keyname}</td>
                    <td className="table-dataStyle">{getValueForProperty(record, point.keyname)}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};
 
export default EquipmentData;