    

import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card,  
} from "@aws-amplify/ui-react";
import Building from "./components/Buildings/Building";

function LoginPage({ signOut }) {  
  return (
    <View className="App">
      <Card>
        <Building/>
        
     
        <Heading level={1}> </Heading>
        </Card>     
        <Button  onClick={signOut} style={{  "background-color": "rgb(47, 58, 76)",color: "white",width: "120px",height: "30px","z-index": "2000",position: "fixed", "margin-top": "-23px","margin-left": "1330px"}} >Sign Out</Button>
    
    </View>
     
  );
}

export default withAuthenticator(LoginPage);