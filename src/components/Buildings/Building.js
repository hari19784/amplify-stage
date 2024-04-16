import React, { useEffect, useState } from "react";
import "../../Building.css";
import { getAllRecords1, getAllRecords2 } from "../../graphql/queries";
import { generateClient } from "aws-amplify/api";
import { useHistory } from "react-router-dom"

import Navigation from "../../Navigation";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

const client = generateClient();

function Building() {
  const [siteData, setSiteData] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [objectData, setObjectData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
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

  const toggleRightPanel = () => {
    setShowRightPanel((prevShowRightPanel) => !prevShowRightPanel);
  };

  const handleBuildingClick = (buildingdata) => {
    setSelectedBuilding(buildingdata);
    console.log("building", buildingdata);
    history.push({
      pathname: "/BuildingData",
      state: { selectedBuilding: buildingdata, objectData: objectData },
    });
  };
  const parseSerialNumber = (str) => {
    const parts = str.split("#");
    return parts[0];
  };


  console.log("buildingRe-rendered");
  return (
    <>
      <div>
        <Navigation ShowRightPanel={showRightPanel} />
        <div style={{ position: "fixed" }}>
          <h2 className="building5"> Buildings</h2>

          <div className="container">
            {siteData &&
              siteData.map((site, index) => {
                const addressObject = JSON.parse(
                  site.Address.replace(/'/g, '"')
                );


               const unique= [...new Set(
                  objectData
                    .filter(
                      (obj) =>
                        parseSerialNumber(obj.ObjectMap) === site.SerialNumber
                    )
                    .map((obj) => {
                      const parts = obj.ObjectMap.split("#");
                      const site2 = parts.length >= 3 ? parts[1] : null;
                     return site2;
                    })
              )] ;
              // console.log("hii",unique);

                return (
                  <div key={index} onClick={() => handleBuildingClick(unique)}>
                    <div className="building">
                      <h1 className="heading">{site.Name}</h1>

                      <p className="location">{`${addressObject.city}, ${addressObject.state}`}</p>
                      <div className="backgroundcolor"></div>
                      <div className="Horizontal"></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <button className="toggle-arrow" onClick={toggleRightPanel}>
        {showRightPanel ? (
          <KeyboardDoubleArrowLeftIcon />
        ) : (
          <KeyboardDoubleArrowRightIcon />
        )}
      </button>
    </>
  );
}

export default Building;
