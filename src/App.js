import React, { useState, 
  useEffect,
  useRef,
  TextareaHTMLAttributes } from "react";
import { Auth, Hub, API, Storage } from 'aws-amplify';
import Amplify from 'aws-amplify';
import config from './aws-exports.js';
// import { listGobjs } from './graphql/queries';
// import { createGobj as createGobjMutation, 
// deleteGobj as deleteGobjMutation, 
// updateGobj as updateGobjMutation } from './graphql/mutations';
import { Alert,
Button,
Heading,
ToggleButton,
Flex, 
Table, 
TableCell, 
TableHead,
TableRow,
TableBody,
ThemeProvider,
Theme,
TextAreaField,
SelectField,
useTheme } from '@aws-amplify/ui-react';
// import { AiTwotoneDelete } from "react-icons/ai";
import "@aws-amplify/ui-react/styles.css";


Amplify.configure(config);

const initialFormState = { customer: '', 
             service: '', 
             claim: '', 
             winloss: '', 
             priority: '', 
             serviceteam: '' }

function App() {

// For midway authentication
const [user, setUser] = useState(null);

useEffect(() => {
Hub.listen('auth', ({ payload: { event, data } }) => {
switch (event) {
case 'signIn':
console.log(event)
console.log(data)
getUser().then(userData => setUser(userData));
break;
case 'signOut':
setUser(null);
break;
case 'signIn_failure':
console.log('Sign in failure', data);
break;
}
});
getUser().then(userData => setUser(userData));
}, []);

function getUser() {
return Auth.currentAuthenticatedUser()
.then(userData => userData)
.catch(() => console.log('Not signed in'));
}

// // Table Theme
// const theme: Theme = {
// name: 'table-theme',
// tokens: {
// components: {
// table: {
// row: {
// hover: {
// backgroundColor: { value: '{colors.blue.20}' },
// },

// striped: {
// backgroundColor: { value: '{colors.blue.10}' },
// },
// },

// header: {
// color: { value: '{colors.blue.80}' },
// fontSize: { value: '{fontSizes.xl}' },
// },

// data: {
// fontWeight: { value: '{fontWeights.semibold}' },
// },
// },
// },
// },
// };

// // For signin and out button
const { tokens } = useTheme();

// // For Gobj
// const [gobjs, setGobjs] = useState([]);
// const [formData, setFormData] = useState(initialFormState);

// useEffect(() => {
// fetchGobjs();
// }, []);

// // Fetch the gobjs in the table
// async function fetchGobjs() {
// const apiData = await API.graphql({ query: listGobjs });
// setGobjs(apiData.data.listGobjs.items);
// }

// // Creating gobjs
// async function createGobj() {
// changeAdding();
// if (!formData.customer) return;
// // await API.graphql({ query: createGobjMutation, variables: { input: formData } });
// await API.graphql({ query: createGobjMutation, variables: { input: { customer: formData.customer, 
//                                                            service: formData.service,
//                                                            claim: formData.claim,
//                                                            winloss: formData.winloss,
//                                                            priority: formData.priority,
//                                                            serviceteam: formData.serviceteam,
//                                                           } } });
// setGobjs([ ...gobjs, formData ]);
// setFormData(initialFormState);
// // setAdding(!adding);
// // setEditing('');
// }

// // Deleting gobjs
// async function deleteGobj({ id }){
// const newGobjArray = gobjs.filter(gobj => gobj.id !== id);
// setGobjs(newGobjArray);
// await API.graphql({ query: deleteGobjMutation, variables: { input: { id } }});
// }

// // Editing gobj
// async function editGobj({ id }){
// console.log(id);
// if(!formData.customer) return;
// await API.graphql({ query: updateGobjMutation,
// variables: { input: { id: id,
//             customer: formData.customer,
//             service: formData.service,
//             claim: formData.claim,
//             winloss: formData.winloss,
//             priority: formData.priority,
//             serviceteam: formData.serviceteam
//           }

//   }
// })
// setEditid('');
// setFormData(initialFormState);
// fetchGobjs();
// }

// // Adding
// const[adding, setAdding] = useState(false);

// async function changeAdding() {
// if(adding == false){
// if(editid!=''){
// setEditid('');
// }
// }
// setAdding(!adding);
// }

// // Editing
// const[editid, setEditid] = useState('');

// async function change({ id }){
// setEditid(id);
// console.log(editid);
// if(adding){
// setAdding(false);
// }
// }

// async function clear() {
// setFormData(initialFormState);
// setAdding(false);
// setEditid('');
// }

// // Controlling who can edit and delete
// async function showUser(){
// console.log(user);
// }

return (
<div className="App">

{user ? (
<>
<Button 
backgroundColor={tokens.colors.pink[40]}
onClick={() => Auth.signOut()}
>
Sign Out
</Button>
</>
) : (
<>

<Button 
backgroundColor={tokens.colors.pink[40]}
onClick={() => Auth.federatedSignIn({customProvider: "AmazonFederate"})}
className='signInAndOut'
>
Sign-In with Midway
</Button>
</>
)}


</div>
);
}

export default App;
