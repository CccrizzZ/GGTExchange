import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    Modal,
    InputGroup, 
    FormControl, 
    Container,
    Row,
    Col,
    Table,
    Form,
    ListGroup
} from 'react-bootstrap'
import './Box.css'
import RetroHitCounter from 'react-retro-hit-counter';
import axios from 'axios'
import { NFTStorage } from 'nft.storage'
const client = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEUzNzczNjBEYTFBRDlmZkU3ZDg1QjcyQTZBMjk1NEUyN0UzZTI3MDgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MDgzMjE2MDIwOSwibmFtZSI6IkRldmVsb3BtZW50LWtleSJ9.fBVoPVoh1z3j6OnPmpzTcjFp-o6QibxhCM_-En31IvI' })



export default class UserLibrary extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            ShowGameSubmitPanel: false,
            UnclaimedRevenue: null,
            StoreListing: null,
            DevSubmissionListing: null,
            MyIncome: null,
            AdminAllSubmissionListing: null,
            AdminTipjar: null,
            AdminAllGamePitch: null,
            PlayerLibrary: null,
        }

        // refs
        this.GameTitleInput = React.createRef()
        this.GameDescInput = React.createRef()
        this.GamePicsInput = React.createRef()
        this.GamePriceInput = React.createRef()
        this.AdminSetRoleAddr = React.createRef()
        this.AdminSetRoleNumber = React.createRef()
    }
    
    

    async componentDidMount(){

        // init according to user role
        switch (this.props.UserRole) {
            case 'Developer':
                console.log("Developer init")
                await this.GetUnclaimedIncomeAmount()
                await this.GetMySubmission()
                break;
            case 'Guest':
                console.log("Guest init")
                break;
            case 'Player':
                this.GetPlayerLibrary()
                console.log("Player init")
                break;
            case 'Admin':
                console.log("Admin init")
                await this.GetAllPitch()
                break;
            default:
                break;
        }

    }




    // verify ownership with smart contract
    // called when starting game
    VerifyGameOwnerShip = async (tokenID) => {

        // call smart contract
        let owner = await this.props.ConnectedContract.methods.ownerOf(tokenID)
        .call({
            from: this.props.WalletAddr 
        })

        // return if owner equals to connected wallet
        return (owner === this.props.WalletAddr)

    }



    // Guest page 
    RenderGuestPage = () => {
        return(
            <div id="modulebox" style={{height: '80vh'}}>
                <hr />
                <h2>please register as player first</h2>
                <hr />
            </div>
        )
    }
    
    
    
    GetPlayerLibrary = async () => {
        // check wallet connection
        if(!this.props.IsConnected()) return

        // show pop over
        this.props.ShowPopup()

        // call smart contract
        let TokenIDArray = await this.props.ConnectedContract.methods.GetMyLibrary()
        .call({
            from: this.props.WalletAddr 
        })
        console.log(TokenIDArray)


        // temp array for data
        let tempArr = []

        // loop user owned token array
        for (let i = 0; i < TokenIDArray.length; i++) {
            let URI = await this.props.ConnectedContract.methods.tokenURI(TokenIDArray[i])
            .call({
                from: this.props.WalletAddr 
            })
            console.log(URI)

            
            // send get request to the uri
            axios.get(URI)
            .then((response) => {
                
                // construct new data obj
                let obj = {
                    name: response.data.name,
                    image: response.data.image,
                    desc: response.data.description
                }

                // push it into temp array
                tempArr.push(obj)

            })
            .catch((error) => {
                // handle error
                console.log(error)
            })

        }

        console.log(tempArr)

    

        // store player library in state
        this.setState({ PlayerLibrary: tempArr })

        // hide pop over
        this.props.HidePopup()

    
    }
    


    RenderPlayerLibrary = () => {
        this.state.AllListings.map((x, i) => {
            return(
                <Card key={i} style={{ width: '100%' }}>
                    <Card.Img variant="top" src={x.URI}/>
                    <Card.Body style={{backgroundColor: '#343a40'}}>
                        <Card.Title>{x.name}</Card.Title>
                        <Card.Text>
                            <hr/>
                            Description: A game about snake eating each other
                            <hr/>
                            Publisher: {x.publisher}
                            <hr/>
                            Price: {x.price} Dev
    
                        </Card.Text>
                        <Button id={x.GID} variant="primary" onClick={(e) => this.BuyGame(x.GID, x.price, e)}>Purchase</Button>
                    </Card.Body>
                </Card>
            )
        } )
    
    }

    // player library
    RenderPlayerLibrary = () => {


        return(
            <div id="modulebox">
                <h2>My Library</h2>
                <hr />

                <div id="griddisplay">
                    {this.PlayerLibrary == null ? null : this.RenderPlayerLibrary}
                </div>

            </div>
        )
    }




    // developer hub
    // show or clsoe developer pitching modal
    ShowGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: true})
    }
    CloseGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: false})
    }


    // developer submit IPFS links containing their pitch
    // if approved it will be listed on the marketplace
    SubmitPitch = async () => {

        // get game description, name, and pictures
        let GameName = this.GameTitleInput.current.value
        let GameDescription = this.GameDescInput.current.value
        let GamePics = this.GamePicsInput.current.files[0]
        let GamePrice = window.web3.utils.toWei(this.GamePriceInput.current.value.toString(), 'ether')

        console.log(GameName)
        console.log(GameDescription)
        console.log(GamePics)
        console.log(GamePrice)


        // null check on input
        if (GameName === "" || GameDescription === "" || GamePrice === "") {
            alert("Please complete the form")
            return
        }

        // show pop over
        this.props.ShowPopup()


        // store description and image on ipfs storage
        const metadata = await client.store({
            name: GameName,
            description: GameDescription,
            image: GamePics
        }) 
        console.log(metadata)


        // store ipfs link in contract 
        // func(string memory name, uint256 price, string memory URI)
        const result = await this.props.ConnectedContract.methods.SubmitPitch(GameName, GamePrice, metadata.url)
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)

        alert("Submission success!")
        
        // hide pop over
        this.props.HidePopup()

        // hide submit panel
        this.CloseGameSubmitModal()

    }


    // pull submission array from smart contract
    GetMySubmission = async () => {

        // check wallet connection
        if(!this.props.IsConnected()) return
        
        // show pop over
        this.props.ShowPopup()

        // call smart contract function
        // "0": "tuple(uint256,string,uint256,string,bool,bool)[]: 1,aaa,1,aaaaaaa,false,false"
        let result = await this.props.ConnectedContract.methods.GetMyGamePitch()
        .call({
            from: this.props.WalletAddr 
        })

        console.log(result)

        // store submission listing in state
        this.setState({ DevSubmissionListing: result })

        // hide pop over
        this.props.HidePopup()
    }



    // render developer submission table
    RenderMySubmission = () => {

        // gname
        // uri
        // price
        // approved = false
        // rejected
        // live
        if(this.props.UserRole !== "Developer") return

        // the link looks like this
        // ipfs://bafyreihwlk5ab2gbmrxet4oorugopvzowqnf4ulq6ztxqztp74gdlcg6ee/metadata.json

        return(
            this.state.DevSubmissionListing.map((x, i) => {
                return(
                    <tr key={i}>
                        <td>{x.name}</td>
                        <td><a id="wrapAnchor" href={x.URI} target="_blank" rel="noreferrer">{x.URI}</a></td>
                        <td>{window.web3.utils.fromWei(x.price)}</td>
                        <td>{x.approved.toString()}</td>
                        <td>{x.rejected.toString()}</td>
                    </tr>
                )
            } )
        )
        
        
    }


    GetUnclaimedIncomeAmount = async () => {
        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.CheckUnclaimedRevenue()
        .call({
            from: this.props.WalletAddr 
        })
        
        // hide pop over
        this.props.HidePopup()
        
        // store to state
        this.setState({UnclaimedRevenue: result})
    }


    // developer claim income
    ClaimIncome = async () => {

        // show pop over
        this.props.ShowPopup()

        // call smart constract
        const result = await this.props.ConnectedContract.methods.WithdrawRevenue()
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)

        
        // refresh unclaimed income counter
        this.GetUnclaimedIncomeAmount()
        
        // hide pop over
        this.props.HidePopup()
    }



    RenderRevenueCounter = (i) => {
        
        if (i = 0) {
            return(
                <RetroHitCounter
                    hits={0}
                    withBorder={true}
                    withGlow={true}
                    minLength={19}
                    size={25}
                    padding={4}
                    digitSpacing={3}
                    segmentThickness={4}
                    segmentSpacing={0.5}
                    segmentActiveColor="#76FF03"
                    segmentInactiveColor="#315324"
                    backgroundColor="#222222"
                    borderThickness={7}
                    glowStrength={0.5}
                    glowSize={4}
                />
            )
        }else{
            return(
                <RetroHitCounter
                    hits={this.state.UnclaimedRevenue==null ? 0 : this.state.UnclaimedRevenue}
                    withBorder={true}
                    withGlow={true}
                    minLength={19}
                    size={25}
                    padding={4}
                    digitSpacing={3}
                    segmentThickness={4}
                    segmentSpacing={0.5}
                    segmentActiveColor="#76FF03"
                    segmentInactiveColor="#315324"
                    backgroundColor="#222222"
                    borderThickness={7}
                    glowStrength={0.5}
                    glowSize={4}
                />
            )

        }

    }

    // developers submit their games here for admin to review
    RenderDeveloperMintShop = () => {
        return(
            <div id="modulebox" style={{minHeight: '80vh'}}>
                <h2>Developer Hub</h2>
                <hr />
                <Container>
                    <Row>
                        <Col id="col2">
                            <h4>Functions</h4>
                            <hr/>
                            <Button id="purplebutton" onClick={this.ShowGameSubmitModal}>Submit New Game</Button>
                            <br/>
                            <Button id="purplebutton" onClick={this.ClaimIncome}>Claim Sales Revenue</Button>
                        </Col>
                        <Col id="col2">
                            <h4>Unclaimed Sales Revenue</h4>
                            <hr/>

                            <RetroHitCounter
                                hits={this.state.UnclaimedRevenue==null ? 0 : this.state.UnclaimedRevenue}
                                withBorder={true}
                                withGlow={true}
                                minLength={19}
                                size={25}
                                padding={4}
                                digitSpacing={3}
                                segmentThickness={4}
                                segmentSpacing={0.5}
                                segmentActiveColor="#76FF03"
                                segmentInactiveColor="#315324"
                                backgroundColor="#222222"
                                borderThickness={7}
                                glowStrength={0.5}
                                glowSize={4}
                            />
                            <hr/>
                            <p>Revenue calculated in wei</p>
                            <p>1 Wei = 1 GLMR(10)<sup>-18</sup></p>
                        </Col>
                    </Row>
                </Container>
                <hr/>



                {/* existing pitch */}
                <h4>My Game Pitch</h4>
                <br />
                <Button id="purplebutton" onClick={this.GetMySubmission}>Refresh</Button>
                <hr />
                <Table style={{border: "2px solid black", marginLeft:"auto", marginRight:"auto"}} variant="warning" bordered size="sm" striped hover>
                    <thead>
                        <tr>
                            <th>Game Name</th>
                            <th>IPFS URL</th>
                            <th>Price (GLMR)</th>
                            <th>Approved</th>
                            <th>Rejected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.DevSubmissionListing == null ? null : this.RenderMySubmission()}
                    </tbody>
                </Table>




                {/* upload panel for developers */}
                <Modal
                    show={this.state.ShowGameSubmitPanel}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title>💾 Submit Pitch</Modal.Title>
                        
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>🎮 Game title:</Form.Label>
                                <Form.Control ref={this.GameTitleInput} type="text" placeholder="Enter your game title" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>🧾 Game Description:</Form.Label>
                                <Form.Control ref={this.GameDescInput} placeholder="Enter your game description" as="textarea" rows={3} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <img style={{maxWidth:"80px"}} src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/ipfs/ipfs.png" alt="ipfs"/>
                                <br/>
                                <Form.Label> Demo Pictures (one single picture)</Form.Label>
                                <Form.Control ref={this.GamePicsInput} type="file" size="sm" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>💰 Your Price (in DEV):</Form.Label>
                                <Form.Control ref={this.GamePriceInput} type="number" placeholder="Enter 0 if you want it to be free" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.CloseGameSubmitModal}>Cancel</Button>
                        <Button variant="primary" onClick={this.SubmitPitch}>Submit</Button>
                    </Modal.Footer>
                </Modal>
    
            </div>
        )
    }

    






    // pull all game pitch from contract
    GetAllPitch = async () => {
        // show pop over
        this.props.ShowPopup()
        
        // call contract
        let result = await this.props.ConnectedContract.methods.GetAllGamePitch()
        .call({
            from: this.props.WalletAddr 
        })
        console.log(result)

        // store to state
        this.setState({AdminAllGamePitch: result})
    
        // hide pop over
        this.props.HidePopup()
    }


    // render all game pitch for admin
    RenderAllPitch = () => {
        // check user role
        if(this.props.UserRole !== "Admin") return

        // render the table rows
        return(
            this.state.AdminAllGamePitch.map((x, i) => {
                return(
                    <tr key={i}>
                        <td><p style={{wordBreak: "break-all"}}>{x.name}</p></td>
                        <td>{x.publisher}</td>
                        <td><a id="wrapAnchor" href={x.URI} target="_blank" rel="noreferrer">{x.URI}</a></td>
                        <td>{window.web3.utils.fromWei(x.price)}</td>
                        <td><Button variant="success" onClick={(e) => this.ApprovePitch(x.publisher, x.GID, e)}>Go</Button></td>
                        <td><Button variant="danger" onClick={(e) => this.RejectPitch(x.publisher, x.GID, e)}>Go</Button></td>

                    </tr>
                )
            } )
        )
        
    }




    // approve game pitch
    ApprovePitch = async (address, gid, e) => {

        console.log(address, gid, e)



        // show pop over
        this.props.ShowPopup()

        // approve
        let result = await this.props.ConnectedContract.methods.ApproveGameByDevID(address, gid-1)
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)
        alert("Pitch Approved!")
        

        // hide pop over
        this.props.HidePopup()
        
        // refresh all pitch list
        this.GetAllPitch()    
    }




    // reject game pitch
    RejectPitch = async (address, gid) => {
        // show pop over
        this.props.ShowPopup()

        // reject
        let result = await this.props.ConnectedContract.methods.RejectGameByDevID(address, gid)
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)

        alert("Pitch Rejected!")
        
        // hide pop over
        this.props.HidePopup()

        // refresh all pitch list
        this.GetAllPitch()
    }




    // get admin tipjar amount
    CheckTipJar = async () => {
        // show pop over
        this.props.ShowPopup()


        let result = await this.props.ConnectedContract.methods.CheckTipJar()
        .call({
            from: this.props.WalletAddr 
        })

        // store to state
        this.setState({AdminTipjar: result})
    
        // hide pop over
        this.props.HidePopup()
    }


    // collect platform income from tipjar
    TouchTipJar = async () => {

        // null check on tipjar
        if(this.state.AdminTipjar == null || this.state.AdminTipjar === 0 || this.state.AdminTipjar === "0")
        {
            alert("Tipjar is empty!")
            return
        }


        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.TouchTipJar()
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)
        alert("Income Collected!")

        // hide pop over
        this.props.HidePopup()
    }


    // set role for certain user
    SetUserRole = async () => {
        // 0 = guest
        // 1 = player
        // 2 = developer
        // 3 = admin

        console.log(this.AdminSetRoleAddr.current.value)
        console.log(this.AdminSetRoleNumber.current.value)


        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.SetRole(this.AdminSetRoleAddr.current.value, this.AdminSetRoleNumber.current.value)
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.props.HidePopup()
        })
        console.log(result)
        alert("Role set success!")

        // hide pop over
        this.props.HidePopup()


    }


    // admin approve developer's pitch
    RenderAdminHub = () => {
        return(
            <div id="modulebox">
                <h2>Admin Hub</h2>
                <hr />
                <Container>
                    <Row>
                        <Col id="col2">
                            <InputGroup className="mb-3">
                                <Button variant="success" onClick={this.CheckTipJar}>CheckTipJar</Button>
                                <FormControl disabled placeholder={this.state.AdminTipjar === null ? null: this.state.AdminTipjar} aria-describedby="basic-addon1"/>
                            </InputGroup>

                            <Button variant="success" onClick={this.TouchTipJar}>TouchTipJar</Button>

                        </Col>
                        <Col id="col2">
                            <ListGroup style={{margin: "auto", marginBottom: "20px", width: '40%'}} variant="flush">
                                <ListGroup.Item variant="dark">0 = Guest</ListGroup.Item>
                                <ListGroup.Item variant="primary">1 = Player</ListGroup.Item>
                                <ListGroup.Item variant="warning">2 = Developer</ListGroup.Item>
                                <ListGroup.Item variant="danger">3 = Admin</ListGroup.Item>
                            </ListGroup>
                            <InputGroup className="mb-3">
                                <Button variant="success" onClick={this.SetUserRole}>SetRole</Button>
                                <FormControl ref={this.AdminSetRoleAddr} placeholder="Address" aria-describedby="basic-addon1"/>
                                <FormControl ref={this.AdminSetRoleNumber} placeholder="Role" aria-describedby="basic-addon1"/>
                            </InputGroup>

                        </Col>
                    </Row>
                </Container>
                <hr />

                <h4>All Game Pitch</h4>
                <br />
                <Button id="purplebutton" onClick={this.GetAllPitch}>Refresh</Button>
                <br />
                <br />
                <br />
                <Table style={{border: "2px solid black", marginLeft:"auto", marginRight:"auto"}} variant="danger" bordered size="sm" striped hover>
                    <thead>
                        <tr>
                            <th>Game Name</th>
                            <th>Developer</th>
                            <th>IPFS URL</th>
                            <th>Price (GLMR)</th>
                            <th>Approve</th>
                            <th>Reject</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.AdminAllGamePitch === null ? null : this.RenderAllPitch()}
                    </tbody>
                </Table>
            </div>
        )
    }


    




    // render library according to role
    // (admin=controlPanel, developer=mintShop, player=library)
    RenderUserLibrary = () => {
        switch (this.props.UserRole) {
            case 'Guest':
                return(this.RenderGuestPage ())
            case 'Player':
                return(this.RenderPlayerLibrary())
            case 'Developer':
                return(this.RenderDeveloperMintShop())
            case 'Admin':
                return(this.RenderAdminHub())
            default:
                break;
        }
    }


    render() {
        return (
            <>
                {this.RenderUserLibrary()}
            </>
        )
    }
}
