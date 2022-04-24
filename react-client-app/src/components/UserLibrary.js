import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    Modal,
    ListGroup, 
    InputGroup, 
    FormControl, 
    Container,
    Row,
    Col,
    Table,
    Form

} from 'react-bootstrap'
import './Box.css'
import RetroHitCounter from 'react-retro-hit-counter';
import { NFTStorage, File } from 'nft.storage'
const client = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEUzNzczNjBEYTFBRDlmZkU3ZDg1QjcyQTZBMjk1NEUyN0UzZTI3MDgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MDgzMjE2MDIwOSwibmFtZSI6IkRldmVsb3BtZW50LWtleSJ9.fBVoPVoh1z3j6OnPmpzTcjFp-o6QibxhCM_-En31IvI' })

export default class UserLibrary extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            ShowGameSubmitPanel: false,
            UnclaimedRevenue: null,
            StoreListing: null,
            MySubmissionListing: null,
            MyIncome: null,
            AdminSubmissionListing: null
        }

        // refs
        this.GameTitleInput = React.createRef()
        this.GameDescInput = React.createRef()
        this.GamePicsInput = React.createRef()
        this.GamePriceInput = React.createRef()
        
    }
    
    

    async componentDidMount(){



        // init according to user role
        switch (this.props.UserRole) {
            case 'Developer':
                console.log("Developer init")
                await this.GetMySubmission()
                break;
            case 'Guest':
                console.log("Guest init")
                break;
            case 'Player':
                console.log("Player init")
                break;
            case 'Admin':
                console.log("Admin init")
                break;
            default:
                break;
        }

    }




    // verify ownership with smart contract
    // called when starting game
    VerifyGameOwnerShip = () => {

        // pull from smart contract

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
    
    
    
    
    RenderPlayerLibraryCard = (img) => {
        return(
            <Card style={{ width: '100%' }}>
                <Card.Img variant="top" src={img}/>
                <Card.Body style={{backgroundColor: '#343a40'}}>
                    <Card.Title>Example Game</Card.Title>
                    <Card.Text>
                        <hr/>
                        Description: A game about snake eating each other
                        <hr/>
                        Publisher: {this.props.WalletAddr}
                        <hr/>
                        Price: 5 Dev

                    </Card.Text>
                    <Button variant="success">Play</Button>
                </Card.Body>
            </Card>
        )
    }
    
    // player library
    RenderPlayerLibrary = () => {

        // pull from smart contract


        return(
            <div id="modulebox">
                <h2>My Library</h2>
                <hr />

                <div id="griddisplay">
                    {this.state.RenderCards("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
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


        // store description and image on ipfs
        const metadata = await client.store({
            name: GameName,
            description: GameDescription,
            image: GamePics
        }) 
        console.log(metadata)


        // call smart contract function
        // func(string memory name, uint256 price, string memory URI)
        const result = await this.props.ConnectedContract.methods.SubmitPitch(GameName, GamePrice, GamePics.url)
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
        if(this.props.WalletAddr === "" || this.props.WalletAddr === null){
            alert("Wallet not connected")
            return
        }

        
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
        this.setState({ MySubmissionListing: result })

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
        if(this.props.UserRole === "Developer")
        return(
            this.state.MySubmissionListing.map((x, i) => {
                return(
                    <tr key={i}>
                        <td>{x.name}</td>
                        <td><a href={x.URI} target="_blank" rel="noreferrer">{x.URI}</a></td>
                        <td>{window.web3.utils.fromWei(x.price)}</td>
                        <td>{x.approved.toString()}</td>
                        <td>{x.rejected.toString()}</td>
                        <td>false</td>
                    </tr>
                )
            } )
        )
        
        
    }


    // developer claim income
    ClaimIncome = () => {

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
                            <Button id="purplebutton" onClick={this.ClaimIncome}>Claim</Button>
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
                            <p>1 Wei = 1 Eth(10)<sup>-18</sup></p>
                        </Col>
                    </Row>
                </Container>
                <hr/>
                



                {/* existing pitch */}
                <h4>My Game Pitch</h4>
                <br />
                <Button id="purplebutton" onClick={this.GetMySubmission}>Refresh</Button>
                <hr />
                <Table style={{border: "2px solid black"}} variant="light" bordered size="sm" striped hover>
                    <thead>
                        <tr>
                            <th>Game Name</th>
                            <th>IPFS URL</th>
                            <th>Price</th>
                            <th>Approved</th>
                            <th>Rejected</th>
                            <th>Available in Store</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.MySubmissionListing == null ? null : this.RenderMySubmission()}

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
                                <Form.Label>📂 Demo Pictures (a single picture that contains everything)</Form.Label>
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

    






    // admin approve developer's pitch
    RenderAdminHub = () => {
        return(
            <div id="modulebox">
                <h2>Admin Hub</h2>
                <hr />
                <Container>
                    <Row>
                        <Col id="col2">

                        </Col>
                        <Col id="col2">

                        </Col>
                    </Row>
                </Container>
                <hr />

                <h4>My Game Pitch</h4>
                <Table style={{border: "2px solid black"}} variant="light" bordered size="sm" striped hover>
                    <thead>
                        <tr>
                            <th>Game Name</th>
                            <th>IPFS URL</th>
                            <th>Price</th>
                            <th>Approved</th>
                            <th>Rejected</th>
                            <th>Available in Store</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.RenderMySubmission()}
                    </tbody>
                </Table>
            </div>
        )
    }


    // admin approve or reject pitch
    ApproveRejectPitch = async (pass) => {

        // show pop over
        this.props.ShowPopup()
        if (pass) {
            

            // call smart contract function
            // func(string memory name, uint256 price, string memory URI)
            let result = await this.props.ConnectedContract.methods.SubmitPitch()
            .send({
                from: this.props.WalletAddr
            }).on('error', async (error) => {
                alert("Error: Transaction Failed")
                // hide pop over
                this.props.HidePopup()
            })
            console.log(result)

            alert("Submission approved!")

            
            
        }else{
            
            
            // call smart contract function
            // func(string memory name, uint256 price, string memory URI)
            let result = await this.props.ConnectedContract.methods.SubmitPitch()
            .send({
                from: this.props.WalletAddr
            }).on('error', async (error) => {
                alert("Error: Transaction Failed")
                // hide pop over
                this.props.HidePopup()
            })
            console.log(result)
            
            
            
            alert("Submission approved!")
            
        }
        // hide pop over
        this.props.HidePopup()


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
