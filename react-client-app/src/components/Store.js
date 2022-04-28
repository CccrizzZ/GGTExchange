import React, { Component } from 'react'
import { 
    Button, 
    Card,
    ListGroup,
} from 'react-bootstrap'
import './Box.css'
import axios from 'axios'


export default class Store extends Component {
    constructor(props) {
        super(props)
        
        // wallet address from parent component
        this.state = {
            AllListings: null,
            ImageArr: null,
        }

    }


    async componentDidMount(){

        // get all store listings
        await this.GetAllListing()
    }

    // playe buy game from store
    BuyGame = async (gid, price, e) => {

        
        console.log(gid, price)

        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.BuyGame(gid)
        .send({
            from: this.props.WalletAddr,

            // send token to smart contract
            value: price
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            this.props.HidePopup()
        })
        console.log(result)

        alert("Transaction Success!")

        // hide pop over
        this.props.HidePopup()
    }

    // pull all listing from contract
    GetAllListing = async () => {
        

        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.GetAllStoreListing()
        .call({
            from: this.props.WalletAddr 
        })
        console.log("All listing from blockchain: \n" + result)
        // hide pop over
        this.props.HidePopup()
        
        // store to state
        this.setState({AllListings: result}) 

        // temp array for data
        let tempArr = []

        for (let i = 0; i < this.state.AllListings.length; i++) {

            // send get request to the uri
            await axios.get(this.state.AllListings[i].URI)
            .then((response) => {

                let obj = {
                    image: response.data.image,
                    desc: response.data.description
                }
                
                // push obj into temp array
                tempArr.push(obj)

            })
            .catch((error) => {
                // handle error
                console.log(error)
            })    
        }

        this.setState({ImageArr: tempArr})
    }


    // render image for each listing 
    RenderListingImage = (i) => {
        return (<img alt="s" src={this.state.ImageArr[i].image} />)
    }

    // render descritions for games
    GetDescription = (i) => {
        return (<ListGroup.Item id="darklistgroup">Description: {this.state.ImageArr[i].desc}</ListGroup.Item>)
    }

    // store page
    RenderStore = () => {
        return(
            this.state.AllListings.map((x, i=0) => {
                return(
                    <Card key={i} style={{ width: '100%' }}>
                        {this.state.ImageArr === null ? null : this.RenderListingImage(i) }
                        <Card.Body style={{backgroundColor: '#343a40'}}>
                            <Card.Title>{x.name}</Card.Title>
                            <Card.Text>
                                <ListGroup style={{marginTop:"20px"}} variant="flush">
                                    <ListGroup.Item id="darklistgroup">GID: {x.GID}</ListGroup.Item>
                                    {this.state.ImageArr === null ? null : this.GetDescription(i)}
                                    <ListGroup.Item id="darklistgroup">Publisher: {x.publisher}</ListGroup.Item>
                                    <ListGroup.Item id="darklistgroup">Price: {window.web3.utils.fromWei(x.price)} Dev</ListGroup.Item>
                                </ListGroup>
                            </Card.Text>
                            <Button variant="success" onClick={(e) => this.BuyGame(x.GID, x.price, e)}>Purchase</Button>
                        </Card.Body>
                    </Card>
                )
            } )
        )

    }


    render() {
        return (
            <div id="modulebox" style={{minHeight: '80vh'}}>
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.state.AllListings === null ? null : this.RenderStore()}
                </div>

            </div>

        )
    }
}
