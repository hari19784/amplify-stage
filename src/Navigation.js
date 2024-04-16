import React, { memo, useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getAllRecords1, getAllRecords2 } from "./graphql/queries";
import image11 from "./Assets/images/building.png";
import image10 from "./Assets/images/trane.png";
import PersonIcon from '@mui/icons-material/Person';
import { useHistory } from 'react-router-dom';
import Publish from "./Publish";

const client = generateClient();
 

const Navigation = ({ ShowRightPanel }) => {
  const [expandedSites, setExpandedSites] = useState([]);
  const [expandedAreas, setExpandedAreas] = useState([]);
  const [siteData, setSiteData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [objectData, setObjectData] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedData, setSelectedData] = useState(null); 
 
  const history = useHistory();

  useEffect(() => {
    const fetchData1 = async () => {
      try {
        const result = await client.graphql({ query: getAllRecords1 });
        setSiteData(result.data.getAllRecords1);
      } catch (error) {
        console.error("Error fetching site data:", error);
      }
    };
    fetchData1();
  }, []);
 
  useEffect(() => {
    const fetchData2 = async () => {
      try {
        const result = await client.graphql({ query: getAllRecords2 });
        setObjectData(result.data.getAllRecords2);
      } catch (error) {
        console.error("Error fetching site data:", error);
      }
    };
    fetchData2();
  }, []);
 
  const handleToggleExpand = (index) => {
    if (expandedSites.includes(index)) {
      setExpandedSites((prevExpandedSites) => prevExpandedSites.filter((id) => id !== index));
     
      setExpandedItems([]);
    } else {
      setExpandedSites((prevExpandedSites) => [...prevExpandedSites, index]);
    
      setExpandedItems([]);
    }
  };
 
  const handleToggleExpandArea = (index) => {
    setExpandedAreas((prevExpandedAreas) =>
      prevExpandedAreas.includes(index) ? prevExpandedAreas.filter((id) => id !== index) : [...prevExpandedAreas, index]
    );
    setExpandedItems([]);
  
  };
 
  const togglePublish = () => {
    setShowPublish(!showPublish);
  };
 
   const parseSerialNumber = (str) => {
    const parts = str.split("#");
    return parts[0];
  };
 
  const parse = (str) => {
    const parts = str.split("#");
    return parts.length >= 3 ? parts[2] : null;
  };
 
  
  const redirect = (item) => {
    setSelectedItem(item);
  
    history.push({
      pathname:"/SelectedItem",
      state:{selectedItem:item}
     
     
    });
  };
 

  const redirect1 = (itemName) => {
    setSelectedData(itemName);
  

    history.push({
      pathname:"/EquipmentData",
      state1 :{selectedData:itemName}
     
    });
  };
 
 

 
// console.log("Navigation Re-rendered")
 
  return (
    <div>
      <div className="backgroundcolor1">
        <div className="image-container">
          <img src={image10} alt="trane" className="box" />
        </div>
        <h2 className="text">Tracer ® Ensemble™</h2>
        <div className="button">
          <span onClick={() => setShowDropdown(!showDropdown)}>
            <PersonIcon style={{ position: 'relative', top: '6px', left: '3px' }} /> Sai kiran
          </span>
          {showDropdown && (
            <div className="DROUPDOWN">
              <a href="#">Password change</a>
              <br />
              <a href="#">Log out</a>
            </div>
          )}
        </div>
      </div>
      <div className="left-panel">          
            {siteData &&
              siteData.map((site, index) => (
                <div key={index}>
                  <div
                    key={index}
                    className={`container2 highlight`}
                    onClick={() => handleToggleExpand(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`sitename`}
                      onClick={() => {
                        handleToggleExpand(index);
                      }}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img src={image11} className="box-image2" alt="Building" />{" "}
                      {site.Name}
                    </div>
                  </div>
                  {expandedSites.includes(index) && (
                    <div >
                      {[...new Set(
                        objectData
                          .filter((obj) => parseSerialNumber(obj.ObjectMap) === site.SerialNumber)
                          .map((obj) => {
                            const parts = obj.ObjectMap.split("#");
                            return parts.length >= 3 ? parts[1] : null;
                          })
                      )].map((site1, index1) => (
                        <div key={index1} className="container1">
                          <div className="highlight1">
                          <span
                            onClick={() => handleToggleExpandArea(index1)}
                           
                          >
                            {expandedAreas.includes(index1) ? "▼" : "▶"}{" "}
                            <span onClick={() => { if (site1) redirect(site1); }}>{site1}</span>
                          </span>
                          </div>
                          {expandedAreas.includes(index1) && (
                            <div >
                              {objectData
                                .filter((obj) => parseSerialNumber(obj.ObjectMap) === site.SerialNumber && obj.ObjectMap.includes(`#${site1}#`))
                                .map((obj, index2) => (
                                  <div onClick={()=>redirect1(parse(obj.ObjectMap))} style={{cursor:'pointer'}} key={index2} className="ObjectMap">
                                    <span >{parse(obj.ObjectMap)}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
      </div>
      <div className={`right-panel ${ShowRightPanel ? "" : "hidden"}`}>
        {showPublish ? (
          <Publish />
        ) : (
          <button className="button2" onClick={togglePublish}> Discovery Request </button>
        )}
      </div>
    </div>
  );
};
 
export default Navigation;
