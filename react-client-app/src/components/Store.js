import React, { Component } from 'react'
import { 
    Button, 
    Card,
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


        let tempArr = []

        for (let i = 0; i < this.state.AllListings.length; i++) {

            // send get request to the uri
            await axios.get(this.state.AllListings[i].URI)
            .then((response) => {
                tempArr.push(response.data.image)
            })
            .catch((error) => {
                // handle error
                console.log(error)
            })    
        }

        this.setState({ImageArr: tempArr})
        
    }

    RenderListingImage = async (i) => {
        return (this.state.ImageArr[i] == null ? "null" : this.state.ImageArr[i])
    }


    // store page
    RenderStore = () => {
        
        
        return(
            this.state.AllListings.map((x, i=0) => {
                console.log(this.state.ImageArr)
                
                return(
                    <Card key={i} style={{ width: '100%' }}>
                        <Card.Img variant="top" src={x.img}/>
                        <Card.Body style={{backgroundColor: '#343a40'}}>
                            <Card.Title>{x.name}</Card.Title>
                            <Card.Text>
                                <hr/>
                                Description: A game about snake eating each other
                                <hr/>
                                Publisher: {x.publisher}
                                <hr/>
                                Price: {window.web3.utils.fromWei(x.price)} Dev

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
            <div id="modulebox">
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.state.AllListings === null ? null : this.RenderStore()}
                </div>

            </div>

        )
    }
}
