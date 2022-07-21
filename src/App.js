import React, {
  useState,
  useEffect,
  useRef,
  TextareaHTMLAttributes,
} from "react";
import { Auth, Hub, API, Storage } from "aws-amplify";
import Amplify from "aws-amplify";
import config from "./aws-exports.js";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createGobjMutation,
  deleteTodo as deleteGobjMutation,
  updateTodo as updateGobjMutation,
} from "./graphql/mutations";
import {
  Alert,
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
  useTheme,
} from "@aws-amplify/ui-react";
import { AiTwotoneDelete } from "react-icons/ai";
import TextareaAutosize from 'react-textarea-autosize';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(config);

const initialFormState = {
  customer: "",
  service: "",
  claim: "",
  winloss: "",
  priority: "",
  serviceteam: "",
  user: ""
};

function App() {
  // For midway authentication
  const [user, setUser] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log(event);
          console.log(data);
          getUser().then((userData) => setUser(userData));
          break;
        case "signOut":
          setUser(null);
          break;
        case "signIn_failure":
          console.log("Sign in failure", data);
          break;
      }
    });
    getUser().then((userData) => setUser(userData));
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => console.log("Not signed in"));
  }

  // Table Theme
  const theme: Theme = {
    name: "table-theme",
    tokens: {
      components: {
        table: {
          row: {
            hover: {
              backgroundColor: { value: "{colors.blue.20}" },
            },

            striped: {
              backgroundColor: { value: "{colors.blue.10}" },
            },
          },

          header: {
            color: { value: "{colors.blue.80}" },
            fontSize: { value: "{fontSizes.xl}" },
          },

          data: {
            fontWeight: { value: "{fontWeights.semibold}" },
          },
        },
      },
    },
  };

  // For signin and out button
  const { tokens } = useTheme();

  // For Gobj
  const [gobjs, setGobjs] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchGobjs();
  }, []);

  // Fetch the gobjs in the table
  async function fetchGobjs() {
    const apiData = await API.graphql({ query: listTodos });
    setGobjs(apiData.data.listTodos.items);
  }

  // Creating gobjs
  async function createGobj() {
    // Establishing user identity
    // setFormData({...formData, user: user.username, });
    // console.log(formData.user.username);
    changeAdding();
    if (!formData.customer) return;
    // await API.graphql({ query: createGobjMutation, variables: { input: formData } });
    await API.graphql({
      query: createGobjMutation,
      variables: {
        input: {
          customer: formData.customer,
          service: formData.service,
          claim: formData.claim,
          winloss: formData.winloss,
          priority: formData.priority,
          serviceteam: formData.serviceteam,
          user: formData.user
        },
      },
    });
    setGobjs([...gobjs, formData]);
    setFormData(initialFormState);
    // setAdding(!adding);
    // setEditing('');
  }

  // Deleting gobjs
  async function deleteGobj({ id }) {
    const newGobjArray = gobjs.filter((gobj) => gobj.id !== id);
    setGobjs(newGobjArray);
    await API.graphql({
      query: deleteGobjMutation,
      variables: { input: { id } },
    });
  }

  // Editing gobj
  async function editGobj({ id }) {
    // Establishing user identity
    // setFormData({...formData, user: user.username, });
    // console.log(formData.user);
    console.log(id);
    if (!formData.customer) return;
    await API.graphql({
      query: updateGobjMutation,
      variables: {
        input: {
          id: id,
          customer: formData.customer,
          service: formData.service,
          claim: formData.claim,
          winloss: formData.winloss,
          priority: formData.priority,
          serviceteam: formData.serviceteam,
          user: formData.user
        },
      },
    });
    setEditid("");
    setFormData(initialFormState);
    fetchGobjs();
  }

  // Adding
  const [adding, setAdding] = useState(false);

  async function changeAdding() {
    // console.log(user);
    // console.log(user.username);
    // Establishing user identity
    // setFormData({...formData, user: user.username, });
    // console.log(formData.user.username);
    if (adding == false) {
      if (editid != "") {
        setEditid("");
      }
    }
    // Change the adding variable
    setAdding(!adding);
  }

  // Editing
  const [editid, setEditid] = useState("");

  async function change({ id }) {
    // Establishing user identity
    // setFormData({...formData, user: user.username, });
    // console.log(formData.user.username);
    // Setting the id
    if (adding) {
      setAdding(false);
    }
    setEditid(id);
    console.log(editid);
    // Adding fetch after setting the change id
    setTimeout(function(){
      console.log("I am the third log after 5 seconds");
      fetchGobjs();
    },1000);
  }

  async function clear() {
    setFormData(initialFormState);
    setAdding(false);
    setEditid("");
  }

  // Controlling who can edit and delete
  async function showUser() {
    console.log(user);
  }

  return (
    <div className="App">
      { user ? (
        <>
          <div className="signInAndOutDiv">
            {/* Sign out button */}
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() => Auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
          <Heading level={1}>Dashboard</Heading>

          <div className="tableDiv">
            <ThemeProvider theme={theme} colorMode="light">
              <Table highlightOnHover variation="striped">
                <TableHead>
                  <TableRow>
                    <TableCell className="theadCell">
                      <b>Customer, SA, <i>Gap</i></b>
                    </TableCell>
                    <TableCell>
                      <b>Service</b>
                    </TableCell>
                    <TableCell>
                      <b>GCP Claim / Customer Feedback</b>
                    </TableCell>
                    <TableCell>
                      <b>
                        Win / Loss to GCP? Key factor resulting in loss and
                        learnings
                      </b>
                    </TableCell>
                    <TableCell>
                      <b>Priority / AWS GCP Compete Team Response</b>
                    </TableCell>
                    <TableCell>
                      <b>Service Team PFR / Roadmap</b>
                    </TableCell>
                    <TableCell>
                      <ToggleButton onClick={() => changeAdding()}>
                        {adding ? <>HIDE</> : <>ADD </>}
                      </ToggleButton>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {adding ? (
                    <>
                      <TableRow>
                        <TableCell>
                         {/* Customer */}
                         <TextareaAutosize
                              className='responsiveTA'
                              // defaultValue={}
                              placeholder="..."
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customer: e.target.value, user: user.username
                                })
                              }
                              value={formData.customer}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Service */}
                          <TextareaAutosize
                                className='responsiveTA'
                                // defaultValue={}
                                placeholder="..."
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    service: e.target.value,
                                  })
                                }
                                value={formData.service}
                            />
                        </TableCell>
                        <TableCell>
                          {/* Claim */}
                          <TextareaAutosize
                              className='responsiveTA'
                              // defaultValue={}
                              placeholder="..."
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  claim: e.target.value,
                                })
                              }
                              value={formData.claim}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Win/Loss */}
                          <TextareaAutosize
                            className='responsiveTA'
                            // defaultValue={}
                            placeholder="..."
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                winloss: e.target.value,
                              })
                            }
                            value={formData.winloss}
                          />
                        </TableCell>
                        <TableCell>
                          <SelectField
                            placeholder="Select"
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                priority: e.target.value,
                              })
                            }
                          >
                            <option
                              value="Priority: High"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              High
                            </option>
                            <option
                              value="Priority: Medium"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Medium
                            </option>
                            <option
                              value="Priority: Low"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Low
                            </option>
                          </SelectField>
                        </TableCell>
                        <TableCell>
                          {/* Service Team */}
                          <TextareaAutosize
                            className='responsiveTA'
                            // defaultValue={}
                            placeholder="..."
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                serviceteam: e.target.value, 
                              })
                            }
                            value={formData.serviceteam}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Button
                              loadingText=""
                              onClick={() => createGobj()}
                              ariaLabel=""
                              className="submitAndCancel"
                            >
                              Submit
                            </Button>
                          </div>
                          <div>
                            <Button
                              loadingText=""
                              onClick={() => clear()}
                              ariaLabel=""
                              className="submitAndCancel"
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <></>
                  )}

                  {/* Iterating over the gobjs */}
                  {gobjs.map((gobj) => (
                    <TableRow key={gobj.id}>
                      {gobj.id == editid ? (
                        <>
                        <TableCell>
                         {/* Customer */}
                         <TextareaAutosize
                              className='responsiveTA'
                              // defaultValue={}
                              placeholder={gobj.customer}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customer: e.target.value, user: user.username
                                })
                              }
                              value={formData.customer}
                          />
                          {/* Prepopulating */}
                          <input
                              defaultValue={gobj.customer}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customer: e.target.value, user: user.username
                                })
                              }
                              ref={formData.customer}
                          >
                          </input>
                        </TableCell>
                        <TableCell>
                          {/* Service */}
                          <TextareaAutosize
                                className='responsiveTA'
                                // defaultValue={}
                                placeholder={gobj.service}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    service: e.target.value,
                                  })
                                }
                                value={formData.service}
                            />
                        </TableCell>
                        <TableCell>
                          {/* Claim */}
                          <TextareaAutosize
                              className='responsiveTA'
                              // defaultValue={}
                              placeholder={gobj.claim}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  claim: e.target.value,
                                })
                              }
                              value={formData.claim}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Win/Loss */}
                          <TextareaAutosize
                            className='responsiveTA'
                            // defaultValue={}
                            placeholder={gobj.winloss}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                winloss: e.target.value,
                              })
                            }
                            value={formData.winloss}
                          />
                        </TableCell>
                        <TableCell>
                          <SelectField
                            placeholder="Select"
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                priority: e.target.value,
                              })
                            }
                          >
                            <option
                              value="Priority: High"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              High
                            </option>
                            <option
                              value="Priority: Medium"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Medium
                            </option>
                            <option
                              value="Priority: Low"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Low
                            </option>
                          </SelectField>
                        </TableCell>
                        <TableCell>
                          {/* Service Team */}
                          <TextareaAutosize
                            className='responsiveTA'
                            // defaultValue={}
                            placeholder={gobj.serviceteam}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                serviceteam: e.target.value, 
                              })
                            }
                            value={formData.serviceteam}
                          />
                        </TableCell>
                          <TableCell>
                            <div>
                              <Button
                                loadingText=""
                                onClick={() => editGobj(gobj)}
                                ariaLabel=""
                                className="submitAndCancel"
                              >
                                Submit
                              </Button>
                            </div>
                            <div>
                              <Button
                                loadingText=""
                                onClick={() => clear()}
                                ariaLabel=""
                                className="submitAndCancel"
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.customer}
                          </TableCell>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.service}
                          </TableCell>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.claim}
                          </TableCell>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.winloss}
                          </TableCell>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.priority}
                          </TableCell>
                          <TableCell fontSize="var(--amplify-font-sizes-small)">
                            {gobj.serviceteam}
                          </TableCell>
                          <TableCell>
                            {/* Controlling who can edit */}
                            {(gobj.user == user.username)? 
                            (<>
                              <div>
                              <Button onClick={() => change(gobj)}>EDIT</Button>
                              </div>
                              <div className='deletIconDiv'>
                                <AiTwotoneDelete
                                  className="deleteIcon"
                                  onDoubleClick={() => deleteGobj(gobj)}
                                />
                              </div> 
                            </>) :
                            (<></>)
                            }
                     
                          </TableCell>
                          {/* <td>{gobj.user}</td> */}
                          {/* <td><button className='editButton' onClick={() => editGobj(gobj)}>EDIT</button></td> */}
                          {/* <td><button className='deleteButton' onClick={() => deleteGobj(gobj)}>DELETE</button></td> */}
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ThemeProvider>
          </div>
        </>
      ) : (
        <>
          <Alert variation="info">Please sign-in to view the dashboard.</Alert>
          <div className="signInAndOutDiv">
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() =>
                Auth.federatedSignIn({ customProvider: "AmazonFederate" })
              }
              className="signInAndOut"
            >
              Sign-In with Midway
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
