import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import BuildingData from "./components/Buildings/BuildingData";
import SelectedItem from "./components/Buildings/SelectedItem";
import EquipmentData from "./components/Buildings/EquipmentData"
import Loginpage from "./LoginPage";


function App() {

    return (


        <Router>
    
         
          <Switch>
          <Route exact path ="/" component={Loginpage}/>
            <Route exact path="/BuildingData" component={BuildingData} />
          <Route exact path="/SelectedItem" component={SelectedItem}/>
          <Route exact path="/EquipmentData" component={EquipmentData}/>
          
          </Switch>
        
        </Router>
     
    );
  }
   
 
export default App;